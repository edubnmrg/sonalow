var express=require(`express`);
var fs =require(`fs`);
var request=require(`request`);
var cheerio=require(`cheerio`);
var app=express();
var exphbs  = require('express-handlebars');
var auth = require('basic-auth');
var cookieParser = require('cookie-parser');
var database = require('./database').instance;
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'sqlben',
  database : 'new_schema'
});


app.use(cookieParser());
app.use(express.static('./imagenes'));
app.use('/public',express.static('public'));
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');



var basicAuth = require('basic-auth');
VALID_USER = "AGENTE"
VALID_PASSWORD = "ORION"
var usuario

function GetPrecio(precioText){
  var result=""
  for(var i=0;i<precioText.length;i++){
    if("0123456789".indexOf(precioText[i])>-1){
      result+=precioText[i];
    }
  }
  return result;
}
connection.connect(function(err){
  if(!err) {
    console.log("Conectado a Base de Datos ... nn");
  } else {
    console.log("Error conectando a Base de Datos ... nn");
  }
});
var auth = function (req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.sendStatus(401);
  };

  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  };
  // console.log("medio "+user.name);
  var rows=[];


  if (user.name === VALID_USER && user.pass === VALID_PASSWORD) {
    return next();
  } else {
    return unauthorized(res);
  };
};


app.get(`/`,auth,function(req,res){

  res.cookie("agente", true);
  database.read(function(visitas){
    res.render('props_form',{visitas});
  })

});

app.get(`/props`,function(req,res){
  if(req.query.query_url){
    url = req.query.query_url
    console.log(url);
    request(url, function(error, response, html){

        var $ = cheerio.load(html);

        var purl,precio, descripcion, titulo, datos,moneda,sup,hab,ban;
        console.log($(".post.destacado").length);
        $(".post.destacado").each(function(i,elem){
          console.log($(elem).find('h4').find('a').attr("href"));
          purl=$(elem).find('h4').find('a').attr("href");
          console.log($(elem).find('h4').find('a').attr("title"));
          titulo=$(elem).find('h4').find('a').attr("title").replace(/\s+/g, ' ');
          console.log($(elem).find('p').text());
          descripcion=$(elem).find('p').text().replace(/\s+/g, ' ');
          console.log($(elem).find('.misc-m2cubiertos').text());
          sup=$(elem).find('.misc-m2cubiertos').text().trim().replace(/\s+/g, ' ');

          console.log($(elem).find('.misc-habitaciones').text());
          hab=$(elem).find('.misc-habitaciones').text().trim().replace(/\s+/g, ' ');
          console.log($(elem).find('.misc-banos').text());
          ban=$(elem).find('.misc-banos').text().trim().replace(/\s+/g, ' ');
          console.log($(elem).find('.price').text());
          var prec =$(elem).find('.price').text();

          if(prec.indexOf("U$S") > -1) {
            moneda=2;
          }else{
            if(prec.indexOf("$") > -1) {
              moneda=1;
            }else{
              moneda=1;
            }
          };
          console.log(GetPrecio(prec));
          console.log("----------------------");
          database.GuardarAnuncioZona(connection,purl,descripcion,titulo,moneda,GetPrecio(prec),sup,hab,ban);
          //console.log(elem.children[1].children[0].children[0].children[0].children[0]);
        });
        // titulo = $("h1").text()
        //
        // precio =$(".venta").text()
        // descripcion =  $("#id-descipcion-aviso").text().trim()
        // datos=[];
        // $(".aviso-datos ul li").each(function(i, elem){
        //   datos.push({texto:$(elem).text()})
        // })
        //
        // var imagenes_arr=[];
        // $(".rsMainSlideImage").each(function(i, elem){
        //   imagenes_arr.push({imagen:$(elem).attr("href")})
        // })

      }
      // res.render('props',{titulo,precio,descripcion,datos,imagenes_arr,agent});
    );
  }
});

app.listen(process.argv[2]);
console.log(`Server is up and running`);
exports=module.exports=app;
