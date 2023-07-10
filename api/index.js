const express = require('express')
const app = express()
const port = 8000
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
app.use(bodyParser.json());

app.use(function(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");     
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");     
	next(); 
});

app.listen(port, () => {
  console.log(`Api listening on port ${port}`)
});

// SEEND MAILS
app.post("/sendemail", (req,res) =>{
  const { email, msg } = req.body;
  const contentHtml = `
  <p> ${msg} </p>
  `;
  const CLIENT_ID = "560768034089-f0ps774b3p2f5o1r85d6qblvudc6n9j4.apps.googleusercontent.com";
  const CLIENT_SECRET = "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";
  const REDIRECT_URI = "https://developers.google.com/oauthplayground";
  const REFRESH_TOKEN = "1//04Scg0NUphUCNCgYIARAAGAQSNwF-L9IruuKN7OzDySQNowCv5XEq--6AfMv9KrR61AWUp-Qm4iJ4uG44bMq0KEBBoDEtPZAibhk";

  const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN});

  async function sendMail(){
    try {
      const accessToken = await oAuth2Client.getAccessToken();
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: "notifications.profesores.udp@gmail.com",
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          refreshToken: REFRESH_TOKEN,
          accessToken: accessToken,
        },
      }); 
    const mailOptions = {
      from: "Profesores.UDP <notifications.profesores.udp@gmail.com>",
      to: email,
      subject: "Aviso de carga de archivos",
      html: contentHtml,
    };
    
    const result = await transporter.sendMail(mailOptions);
    return result;
    } catch(err){
      console.log(err);
    }
  }
  sendMail()
  .then((result) => res.send(true))
  .catch((error) => res.send(false));
});


// UPLOADS FILES CONFIGURATION
const multer = require('multer');
const fs = require('fs')
const options = {
    storage: multer.diskStorage({
        destination: './uploads/',
        filename: function naming (req, file, cb){
            cb(null, file.originalname);
        }
    })
};
app.use(multer(options).single('archivo'));

app.post("/uploadFile", (req, res) => {
  const query1 = "INSERT INTO TipoEntrega (nombre, id_evaluacion, nombre_archivo) VALUES ('"+req.body.nombre+"', '"+req.body.id_evaluacion+"','"+req.file.filename+"');";
  connection.query(query1, function(err, rows, fields) {
    if (err) res.send(false);
    const query2 = "SELECT COUNT(id) AS cantidad_post FROM TipoEntrega WHERE id_evaluacion = "+req.body.id_evaluacion+";";
    connection.query(query2, function(err, rows, fields) {
      if (err) res.send(false);
      const query3 = "UPDATE Evaluaciones SET cantidad_post = "+rows[0].cantidad_post+" WHERE id = "+req.body.id_evaluacion+";";
      connection.query(query3, function(err, rows, fields) {
        if (err) res.send(false);
        res.send(true);
      }); 
    }); 
  }); 
});

app.post("/readFiles", (req, res) => {
  const query = "SELECT * FROM TipoEntrega WHERE id_evaluacion = "+req.body.id_evaluacion+";"; 
  connection.query(query, function(err, rows, fields) {
    if (err) throw err;
    res.send(rows);
  }); 
});

app.post("/deleteFile", (req, res) => {
  const query1 = "DELETE FROM TipoEntrega WHERE id = "+req.body.id+";"; 
  connection.query(query1, function(err, rows, fields) {
    if (err) throw err;
    try {
      const file = './uploads/'+req.body.nombre_archivo;
      fs.unlinkSync(file);

      const query2 = "SELECT COUNT(id) AS cantidad_post FROM TipoEntrega WHERE id_evaluacion = "+req.body.id_evaluacion+";";
      connection.query(query2, function(err, rows, fields) {
        if (err) res.send(false);
        const query3 = "UPDATE Evaluaciones SET cantidad_post = "+rows[0].cantidad_post+" WHERE id = "+req.body.id_evaluacion+";";
          connection.query(query3, function(err, rows, fields) {
            if (err) res.send(false);
            res.send(true);
          }); 
      }); 
    } catch(err) {
      console.error('Something wrong happened removing the file', err)
      res.send(false);
    }
  }); 
});

app.get("/dowloadFile/:nombre_archivo", (req, res) =>{
  const path = __dirname+'/uploads/'+req.params.nombre_archivo;
  res.download(path);
});

app.get("/viewFile/:nombre_archivo", (req, res) =>{
  const path = __dirname+'/uploads/'+req.params.nombre_archivo;
  res.sendFile(path);
});



  
// -------- MYSQL Connection--------
var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'IngSoftware',
  database : 'Proyecto'
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("MySql conected");
});

// -------- Peticiones MySql --------
app.get("/", (req, res) => {
  res.send("api operativa")
})

app.post("/login", (req, res) => {
  const query = 'select * from users where user = "'+req.body.name+'" and password = "'+req.body.password+'";';
  connection.query(query, function(err, rows, fields) {
    if (err) throw err;
    res.send(rows);
  }); 
});

app.post("/loginRoot", (req, res) => {
  const query = 'select * from admin where user = "'+req.body.name+'" and password = "'+req.body.password+'";';
  connection.query(query, function(err, rows, fields) {
    if (err) throw err;
    res.send(rows);
  }); 
});

app.get("/databases", (req, res) => {
connection.query('show databases;', function(err, rows, fields) {
  if (err) throw err;
  res.send(rows);
}); 
})

app.get("/profesores", (req, res) => {
  connection.query('SELECT * FROM `Profesor`;', function(err, rows, fields) {
    if (err) throw err;
    res.send(rows);
  });
})

app.get("/cursos", (req, res) => {
  connection.query('SELECT * FROM `Cursos`;', function(err, rows, fields) {
    if (err) throw err;
    res.send(rows);
  });
})

app.post('/addProfesor', (req, res) => {
  const query1 = "SELECT * FROM Profesor WHERE mail = '"+req.body.mail+"';";
  connection.query(query1, function(err, rows, fields) {
    if (err) throw err;
    if(rows.length > 0){
      res.send("1");
    }
    else{
      const query2 = "SELECT * FROM users WHERE user = '"+req.body.user+"';";
      connection.query(query2, function(err, rows, fields) {
        if (err) throw err;
        if(rows.length > 0){
          res.send("2");
        }
        else{
          const query3 = "INSERT INTO Profesor (nombre, mail, isOk) VALUES ('"+req.body.nombre+"', '"+req.body.mail+"', 0);";
          connection.query(query3, function(err,data){
            if(err){
              throw err;
            }
            else{
              const query4 = "SELECT * FROM Profesor WHERE mail = '"+req.body.mail+"';";
              connection.query(query4, function(err, rows, fields) {
                if (err) throw err;

                  const query5 = 'insert into users(id, user, password) values ('+rows[0].id+',"'+req.body.user+'","'+req.body.password+'");';
                  connection.query(query5, function(err, rows, fields) {
                    if (err) throw err;
                    res.send("3");
                  });
  
              });
              
            }
          });
        }
      });
    }
  });

  

  
});

app.post("/addCurso", (req, res) => {

  const query1 = "SELECT * FROM Cursos WHERE nombre = '"+req.body.nombre+"' AND año = '"+req.body.año+"' AND semestre = '"+req.body.semestre+"' AND seccion = '"+req.body.seccion+"';";
  connection.query(query1, function(err, rows, fields) {
    if (err) res.send(false);
      if(rows.length > 0){
        res.send("1");
      }
      else{
        const query2 = 'insert into Cursos(nombre, año, semestre, seccion) values ("'+req.body.nombre+'","'+req.body.año+'","'+req.body.semestre+'","'+req.body.seccion+'");';
        connection.query(query2, function(err, rows, fields) {
          if (err) res.send(false);
          res.send("2");
        });
      }
  });
})

app.post("/deleteCurso", (req, res) => {
  const query = 'delete from Cursos where id = '+req.body.id+';';
  connection.query(query, function(err, rows, fields) {
    if (err){
      res.send(false);
    }
    else{
      res.send(true);
    }
  });
})

app.post("/deleteProfesor", (req, res) => {
  const query1 = 'delete from Profesor where id = '+req.body.id+';';
  const query2 = 'delete from users where id = '+req.body.id+';';
  connection.query(query1, function(err, rows, fields) {
    if (err){
      res.send(false);
    }
    else{
      connection.query(query2, function(err, rows, fields) {
        if (err){
          res.send(false);
        }
        else{
          res.send(true);
        }
      });
    }
  });
})

app.post("/editCurso", (req, res) => {

  const query1 = "SELECT * FROM Cursos WHERE nombre = '"+req.body.nombre+"' AND año = '"+req.body.año+"' AND semestre = '"+req.body.semestre+"' AND seccion = '"+req.body.seccion+"' AND id != "+req.body.id+";";
  connection.query(query1, function(err, rows, fields) {
    if (err) res.send(false);
    if(rows.length > 0){
      res.send("1");
    }
    else{
      const query2 = 'update Cursos set nombre="'+req.body.nombre+'", año='+req.body.año+', semestre='+req.body.semestre+', seccion='+req.body.seccion+' where id='+req.body.id+';';
      connection.query(query2, function(err, rows, fields) {
        if (err) res.send(false);
        res.send("2");
      });
    }
  });
});

app.post("/idCurso", (req, res) => {
  const query = 'select * from Cursos where id = '+req.body.id+';';
  connection.query(query, function(err, rows, fields) {
    if (err){
      res.send(false);
    }
    else{
      res.send(rows);
    }
  });
});

app.post("/editProfesor", (req, res) => {

  const query1 = "SELECT * FROM Profesor WHERE mail = '"+req.body.mail+"' AND id != "+req.body.id+";";
  connection.query(query1, function(err, rows, fields) {
    if (err) res.send(false);
    if(rows.length > 0){
      res.send("1");
    }
    else{
      const query2 = "SELECT * FROM users WHERE user = '"+req.body.user+"' AND id != "+req.body.id+";";
      connection.query(query2, function(err, rows, fields) {
        if (err) throw err;
        if(rows.length > 0){
          res.send("2");
        }
        else{
          const query3 = 'update Profesor set nombre="'+req.body.nombre+'", mail="'+req.body.mail+'" where id='+req.body.id+';';
          connection.query(query3, function(err, rows, fields) {
            if (err) res.send(false);

            const query4 = 'update users set user="'+req.body.user+'", password="'+req.body.password+'" where id='+req.body.id+';'; 
            connection.query(query4, function(err, rows, fields) {
              if (err) res.send(false);

              res.send("3");
            });
            
          });
        }
      });
    }
  });
});

app.post("/idProfep", (req, res) => {
  const query = 'select * from Profesor where id = '+req.body.id+';';
  connection.query(query, function(err, rows, fields) {
    if (err){
      res.send(false);
    }
    else{
      res.send(rows);

    }
  });
});

app.post("/idProfeu", (req, res) => {
  const query = 'select * from users where id = '+req.body.id+';';
  connection.query(query, function(err, rows, fields) {
    if (err){
      res.send(false);
    }
    else{
      res.send(rows);
    }
  });
});

app.post("/asignarCurso", (req, res) => {
  const query1 = 'insert into ProfesoresCursos (id_profesor, id_curso) values ('+req.body.id_profesor+', '+req.body.id_curso+');';
  connection.query(query1, function(err, rows, fields) {
    if (err){
      res.send(false);
    }
    else{
      res.send(true);
    }
  });
});

app.post("/getCursoByID", (req, res) => {
  const query = 'select * from Cursos where id in (select id_curso from ProfesoresCursos where id_profesor = '+req.body.id_profesor+');';
  connection.query(query, function(err, rows, fields) {
    if (err){
      res.send(false);
    }
    else{
      res.send(rows);
    }
  });
});

app.post("/deleteAsignacion", (req, res) => {
  const query1 = 'delete from ProfesoresCursos where id_profesor='+req.body.id_profesor+' and id_curso='+req.body.id_curso+';';
  const query2 = 'update Cursos set asignado = 0 where id = '+req.body.id_curso+';';
  connection.query(query1, function(err, rows, fields) {
    if (err){
      res.send(false);
    }
    else{
      connection.query(query2, function(err, rows, fields) {
        if (err){
          res.send(false);
        }
        else{
          res.send(true);        
        }
      });
    }
  });
});

app.post("/printCursosNoAsignados", (req, res) => {
  const query = "select * from Cursos where id not in (select id_curso from ProfesoresCursos where id_profesor = "+req.body.id_profesor+");";
  connection.query(query, function(err, rows, fields) {
    if (err){
      res.send(false);
    }
    else{
      res.send(rows);
    }
  });
});

app.post("/printEvaluacionesByID", (req, res) => {
  const query = 'select * from Evaluaciones where id_profesor='+req.body.id_profesor+' and id_curso='+req.body.id_curso+';';
  connection.query(query, function(err, rows, fields) {
    if (err){
      res.send(false);
    }
    else{
      res.send(rows);
    }
  });
});

app.post("/addEvaluacion", (req, res) => {
  const query1 = 'insert into Evaluaciones (nombre, id_profesor, id_curso, isok, cantidad_post) values ("'+req.body.nombre+'",'+req.body.id_profesor+','+req.body.id_curso+', 0, 0);';
  connection.query(query1, function(err, rows, fields) {
    if (err) res.send(false);
    
    const query2 = "SELECT COUNT(id) AS cantidad_evaluaciones FROM Evaluaciones WHERE id_profesor = "+req.body.id_profesor+" AND id_curso = "+req.body.id_curso+";";
    connection.query(query2, function(err, rows, fields) {
      if (err) res.send(false);

      const query3 = "UPDATE Cursos SET cantidad_evaluaciones = "+rows[0].cantidad_evaluaciones+" WHERE id = "+req.body.id_curso+";";
      connection.query(query3, function(err, rows, fields) {
        if (err) res.send(false);
          res.send(true);
      });
    });
  });
});

app.post("/deleteEvaluacion", (req, res) => {
  const query1 = 'delete from Evaluaciones where id = '+req.body.id+';';
  connection.query(query1, function(err, rows, fields) {
    if (err) res.send(false);
    
    const query2 = "SELECT COUNT(id) AS cantidad_evaluaciones FROM Evaluaciones WHERE id_profesor = "+req.body.id_profesor+" AND id_curso = "+req.body.id_curso+";";
      connection.query(query2, function(err, rows, fields) {
        if (err) res.send(false);
        const query3 = "UPDATE Cursos SET cantidad_evaluaciones = "+rows[0].cantidad_evaluaciones+" WHERE id = "+req.body.id_curso+";";
          connection.query(query3, function(err, rows, fields) {
            if (err) res.send(false);
            res.send(true);
          }); 
      }); 
  
  
  });
});

app.post("/editEvaluacion", (req, res) => {
  const query = 'update Evaluaciones set nombre = "'+req.body.nombre+'" where id = '+req.body.id+';';
  connection.query(query, function(err, rows, fields) {
    if (err){
      res.send(false);
    }
    else{
      res.send(true);
    }
  });
});

app.post("/foundPost", (req, res) => {
  const query = "SELECT COUNT(id) AS cantidad_post FROM TipoEntrega WHERE id_evaluacion = "+req.body.id_evaluacion+";";
  connection.query(query, function(err, rows, fields) {
    if (err){
      res.send(false);
    }
    else{
      res.send(rows);
    }
  });
});
