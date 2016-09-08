var fs =require(`fs`);


function Database(){}

Database.prototype.read = function(callback){
  var visitas = [];
  var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream('./historial.txt')
  });

  lineReader.on('line', function (line) {
    var partes=[];
    partes=line.split(",");
    //console.log(partes[0]+partes[1]);
    visitas.push({texto: partes[0],numero: partes[1]});
  });
  lineReader.on('close',function(){
    callback(visitas)
  });
  return true;
}
Database.prototype.write = function(item){
  var fs = require('fs');
  fs.appendFile("./historial.txt", (item), function (err) {
  });
}


Database.prototype.flush = function(){

}

Database.prototype.GuardarAnuncioZona=function(connection,url,descripcion,titulo,moneda,precio,sup,hab,ban){

  new Promise(function(resolve,reject){

    if(precio==''){precio=0};
    console.log("insert into anuncios (url,descripcion,titulo,moneda_id,precio,superficie,ambientes,banios) values ('"+url+"','"+descripcion+"','"+titulo+"',"+moneda+","+precio+",'"+sup+"','"+hab+"','"+ban+"')")  ;

    connection.query("insert into ANUNCIOS (url,descripcion,titulo,moneda_id,precio,superficie,ambientes,banios) values ('"+url+"','"+descripcion.trim().substring(0,1023)+"','"+titulo+"',"+moneda+","+precio+",'"+sup+"','"+hab+"','"+ban+"')",function(err,rows,fields){
        if(err){
          reject(err)
        }else{
          resolve(rows)
        }
      });
  }).then(function(rows){
    console.log(rows.length)
  },function(err){
    if (err.errno!=1062){
      console.log(err,err.code,err.errno);
    }

  });
};
module.exports.instance = new Database();
