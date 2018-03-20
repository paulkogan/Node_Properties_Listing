'use strict';

//const path = require('path');
const express = require('express');
const config = require('./propconfig');

const props = express();

const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false })

props.set('trust proxy', true);

//props.use('/props', require('./propcrud'));

const pModel =  require('./model-props');



props.get('/', (req, res) => {
    res.redirect('/props');
  });


props.get('/props', (req, res) => {
  var output="Welcome to Properties Listing <br>" 
  pModel.list( function(err, entities, cursor){

    if (err) {
      //next(err);
      console.log("Boom! "+err);
      //return;
    }

    output +=  "We found: "+entities.length+ " properties  <br><br>" 
    for (let i=0;i<entities.length;i++) {
         output += "Property number "+parseInt(i+1)+" : "+JSON.stringify(entities[i])+"<br><br>"

     }    
    res.send(output)

  });
});

props.get('/add', (req, res) => {
       res.sendFile( __dirname + "/" + "addprop.html");
});



props.get('/form', (req, res) => {
   res.sendFile( __dirname + "/" + "addprop.html");

  });




props.get('/delete/:id', (req, res) => {
      pModel.delete (req.params.id, (err, results) => { 

              //err comes back but not results 
              if (err) {
                console.log("Props: Delete problem "+JSON.stringify(err));
              }
              //console.log("Delete err details  "+JSON.stringify(err));
              res.send("Deleted - affected rows: "+results.affectedRows)
      });

});




// router.get('/:book/edit', (req, res, next) => {
//   getModel().read(req.params.book, (err, entity) => {
//     if (err) {
//       next(err);
//       return;
//     }
//     res.render('books/form.pug', {
//       book: entity,
//       action: 'Edit'
//     });
//   });
// });




// insert the new property
props.post('/process_add', urlencodedParser, (req, res) => {
  const data = req.body
  pModel.create(data, (err, savedData) => {
    if (err) {
      //next(err);
      console.log("Boom! "+err);
    }
    //res.redirect(`${req.baseUrl}/${savedData.id}`);
    res.send("Just added: "+savedData.address) 
  });
});


//show 1 record
// getModel().read(req.params.book, (err, entity) => {

//             if (err) {
//               next(err);
//               return;
//             }

//             res.render('books/form.pug', {
//               book: entity,
//               action: 'Edit'
//             });

// });






// Basic 404 handler
props.use((req, res) => {
  res.status(404).send('Not Found');
});


  // Start the server
  const server = props.listen(config.get('PORT'), () => {
    const port = server.address().port;
    console.log(`props listening on port ${port}`);
  });


module.exports = props;

