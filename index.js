const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser')
const multer = require("multer")
var fs = require('fs');

const app = express();
app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345",
    database: "College_data" 
  });

app.set('view engine','ejs')


app.get('/',(req,res)=>{
    // res.send('Hello Testing')
    res.render('registration')
})

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
  
        // Uploads is the Upload_folder_name
        cb(null, "public/")
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + "-" + Date.now()+".jpg")
    }
  })
  var upload = multer({storage:storage}).single('mypic');

app.post('/registration',upload,(req,res)=>{

    let body = req.body;
    // console.log(req.file.path)
    let fname = body.fname.trim();
    let image_name = req.file.path.replace('public/','');


    let sql = `INSERT INTO Students (first_name,last_name,branch,phone,city,image_name) VALUES ('${fname}','${body.lname}','${body.branch}','${body.phone}','${body.city}','${image_name}')`;

    con.query(sql, function (err, result) {
        if (err) throw err;
        res.redirect('/show_details');
    });

})


app.get('/show_details',(req,res)=>{

    let sql = `SELECT * FROM Students`;

    con.query(sql, function (err, result) {
        if (err) throw err;
        res.render('all_result',{data:result});
    });

})

app.get('/edit_details/:id',(req,res)=>{
    let id = req.params.id;
    let sql = `SELECT * FROM Students WHERE id='${id}'`;
    con.query(sql,(err,result)=>{
        if(err){
            console.log(err);
        }else{
        
            let sql = `SELECT branch FROM Students`;    
            con.query(sql,(err,data)=>{
               if(err) throw err;

                res.render('edit_form',{data:result, branch: data});
           
           })        

        }
    })

})

app.get('/delete_details/:id',(req,res)=>{
    let id = req.params.id;

    let sql_select = `SELECT image_name FROM Students WHERE id = '${id}' `;

    con.query(sql_select,(err,result)=>{
        if(err){
            console.log(err);
        }else{
            if(result[0].image_name != ''){     
             fs.unlinkSync(`public/${result[0].image_name}`);  
            }  

            let sql = `DELETE FROM Students WHERE id='${id}' `;
                con.query(sql,(error,result)=>{
                if(error)  throw error;  
                res.redirect('/show_details');
            })

        }
    })

})

app.post('/update_details/:id',upload,(req,res)=>{
    let sid = req.params.id;
    let body = req.body;

    // let sid = body.sid;
    let fname = body.fname.trim();
    let lname = body.lname.trim();
    let branch = body.branch.trim();
    let phone = body.phone;
    let city = body.city.trim();

    let image_name;

    if(req.file){
         image_name = req.file.path.replace('public/','');
         if(body.old_img){
            let old_img_path = `public/${body.old_img}`; 
             fs.unlinkSync(old_img_path);
         }
    }else{
         image_name =  body.old_img.tirm();
    }



    let sql = `UPDATE Students SET first_name = '${fname}' , last_name = '${lname}', branch = '${branch}', phone = '${phone}',
     city = '${city}',image_name = '${image_name}'  WHERE id = ${sid} `;
    con.query(sql,(err,result)=>{
        if(err){
            console.log(err);
        }else{
            res.redirect('/show_details');
        }
    })

})




app.listen(8080,(err)=>{

    if(err) throw err;
    console.log('server is running 8080')
})



