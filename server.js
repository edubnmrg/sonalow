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
var low= require('lowdb');
const dblow=low('db.json', { storage: require('lowdb/lib/file-async') });
dblow.defaults({ Properties: [], Datos:[],Imagenes:[],Servicios:[],Buildings: [], BuildingType:[], Services:[],urls:[]})
  .value();
  // dblow.get('urls')
  // .remove({id: 0})
  // .value()
  // dblow.get('Datos')
  // .remove({ prop_id: 0 })
  // .value()
// dblow.get('Services')
// .push({id:7, service:"piscina"})
// .value();
// dblow.get('Services')
// .push({id:8, service:"gimnasio"})
// .value();
// dblow.get('Services')
// .push({id:9, service:"lavadero"})
// .value();
// Property.add({
//  name: { type: Types.Text, initial: true, required: true },
//  building: { type: Types.Relationship, ref: 'Building', required: true, initial: true },
//  apartment: {
//    number: { type: Types.Number },
//    expenses: { type: Types.TextArray }
//  },
//  construction: {
//    orientation: { type: Types.Select, options: 'N, NE, E, SE, S, SW, W, NW' },
//    floorSize: {
//      total: { type: Types.Number },
//      outdoors: { type: Types.Number }
//    },
//    rooms: {
//      total: { type: Types.Number },
//      bedrooms: { type: Types.Number },
//      baths: { type: Types.Number }
//    }
//  }
// });
// Building.add({
//  name: { type: Types.Text, initial: true, required: true },
//  type: { type: Types.Relationship, ref: 'BuildingType', initial: true, required: true },
//  location: {
//    address: {
//      street: { type: Types.Text, required: true, initial: true },
//      number: { type: Types.Number, required: true, initial: true }
//    },
//    neighborhood: { type: Types.Relationship, ref: 'Area' }
//  },
//  services: { type: Types.Relationship, ref: 'Service', filters: { common: true },
//    many: true },
//  construction: {
//    builtIn: { type: Types.Number }
//  },
//  apartment: {
//    totalApartments: { type: Types.Number }
//  },
//  expenses: { type: Types.TextArray }
// });
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
app.get(`/Guardadas`,function(req,res){
  var u=[]
  for(var i=0;i<dblow.get("urls").size().value();i++){
    u.push(dblow.get("urls["+i+"].url").value())
  };
  res.render('urls_form',{u});
});

app.get(`/props`,function(req,res){
  if(req.query.query_url){
    url = req.query.query_url
    //console.log("query "+url);
    request(url, function(error, response, html){
      var $ = cheerio.load(html);
      var purl,precio, descripcion, titulo, datos_arr,imagenes_arr,servicios_arr,moneda,sup,hab,ban;

      // console.log($(elem).find('h4').find('a').attr("title"));
      // titulo=$(elem).find('h4').find('a').attr("title").replace(/\s+/g, ' ');
      // console.log($(elem).find('p').text());
      // descripcion=$(elem).find('p').text().replace(/\s+/g, ' ');
      // console.log($(elem).find('.misc-m2cubiertos').text());
      // sup=$(elem).find('.misc-m2cubiertos').text().trim().replace(/\s+/g, ' ');
      //
      // console.log($(elem).find('.misc-habitaciones').text());
      // hab=$(elem).find('.misc-habitaciones').text().trim().replace(/\s+/g, ' ');
      // console.log($(elem).find('.misc-banos').text());
      // ban=$(elem).find('.misc-banos').text().trim().replace(/\s+/g, ' ');
      // console.log($(elem).find('.price').text());
      // var prec =$(elem).find('.price').text();
      //
      // if(prec.indexOf("U$S") > -1) {
      //   moneda=2;
      // }else{
      //   if(prec.indexOf("$") > -1) {
      //     moneda=1;
      //   }else{
      //     moneda=1;
      //   }
      // };
      // console.log(GetPrecio(prec));
      // console.log("----------------------");



              titulo = $("h1").text()

              precios =$(".venta").text().trim();
              precio9=precios.replace(/\n+/,"")
              precio=precio9.replace(/\t+/," ")
              descripcion =  $("#id-descipcion-aviso").text().trim()
              datos_arr=[];
              $(".aviso-datos ul li").each(function(i, elem){
                var trimed=$(elem).text().trim()
                var no9=trimed.replace(/\n+/,"")
                var notab=no9.replace(/\t+/," ")
                // console.log($(elem).text().trim().replace(/ +/," "))
                // for(var j=0;j<$(elem).text().length;j++){
                //   console.log($(elem).text().charCodeAt(j));
                // }

                datos_arr.push({texto:notab});
              })
              imagenes_arr=[]
              $(".rsMainSlideImage").each(function(i, elem){
                imagenes_arr.push({imagen:$(elem).attr("href")});
              })
              servicios_arr=[];
              $(".list.list-checkmark.no-margin li").each(function(i, elem){
                //console.log("servicio: "+$(elem).text());
                  servicios_arr.push({texto:$(elem).text().trim()});
              })
              console.log("regex")
              var r=/-[0-9]*.html/.exec(url)
              console.log(/[0-9]+/.exec(r[0]))
              prop2Json(url,titulo,precio,descripcion,datos_arr,imagenes_arr,servicios_arr)
      //res.render('props',{titulo,precio,descripcion,datos_arr,imagenes_arr,servicios_arr});
      nurl=url.slice(26);

      dblow.get('urls')
      .remove({url: nurl})
      .value()

      res.redirect("/Guardadas")
    });
  }
  });
function prop2Json(url,titulo,precio,descripcion,datos_arr,imagenes_arr,servicios_arr){
  var prop_id=dblow.get('Properties.length').value()

  dblow.get("Properties").push({id:prop_id,url:url,titulo:titulo,descripcion:descripcion,precio:precio}).value()

  for(var i=0;i<datos_arr.length;i++){
    dblow.get('Datos').push({prop_id:prop_id,texto:datos_arr[i].texto}).value()
  }
  for(var i=0;i<servicios_arr.length;i++){
    dblow.get('Servicios').push({prop_id:prop_id,texto:servicios_arr[i].texto}).value()
  }

  for(var i=0;i<imagenes_arr.length;i++){
    dblow.get('Imagenes').push({prop_id:prop_id,imagen:imagenes_arr[i].imagen}).value()
  }

  //console.log("parse prp");
  //var t=JSON.parse(prp)

};

app.get(`/Extraer`,function(req,res){
  var tiempo=15000;
  //console.log(tiempo);
  //console.log(dblow.get('urls').size().value())
  //for(var i=1;i<dblow.get('urls').size().value();i++){
    for(var i=1;i<10;i++){
      tiempo+=Math.random()*60000;

        setTimeout(ejecutar(res,"/props?query_url=http://www.zonaprop.com.ar"+dblow.get('urls['+i+'].url').value()),tiempo)
  };
});
function ejecutar(res,direccion){
  res.redirect(direccion)

};
app.get(`/detalle`,function(req,res){
  if(req.query.query_url){
    url = req.query.query_url
    //console.log("DETALLE"+url);
    request(url, function(error, response, html){
      res.send(url);
    })
  }
});
app.listen(process.argv[2]);
console.log(`Server is up and running`);
exports=module.exports=app;
