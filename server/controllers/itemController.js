const mysql = require('mysql');
const router = require('../routes/user');
const mathjs = require('mathjs');

const pool = mysql.createPool({


    connectionLimit : 100,
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_NAME,
    multipleStatments: true
    });

// Main Page View Table    
exports.view = (req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err;
        console.log('connected as ID' + connection.threadId);
        // use connection
        let sql = 'SELECT * FROM pos_entry';
        connection.query(sql, (err, rows) => {
            connection.release();
            if(!err){
                var amount = 0.0;
                var qnty = 0.0;
                var tax = 0.0;
                var  netamount = 0.0;

               for(var i = 0; i<rows.length; i++)
                {

                       amount = amount + (rows[i].gross_amount);
                       qnty = qnty + (rows[i].item_qnty);
                       tax = tax + (rows[i].gst_charge);
                       netamount = netamount + (rows[i].net_amount);
               }


               res.render('home', {rows, 
                   posts: [{
                           amount: amount.toFixed(2),
                           qnty: qnty.toFixed(2),
                           tax: tax.toFixed(2),
                           netamount: netamount.toFixed(2)
                   }]
                  
               });
            }
            else{
                console.log(err);
            }
            console.log('data from table: \n', rows);
        });
    });
}

exports.posSubmit = (req, res) => {

    var posday =req.body.btnadd;

    if (posday === 'Submit') {
        //update action
        pool.getConnection((err, connection) => {
            if(err) throw err;
            // use connection
                    let sql = 'insert into pos_day SELECT * FROM pos_entry';
                    connection.query(sql, (err, rows) => {
                       if(!err){
                           console.log("data saved");
 
                            }
                        else{
                            console.log(err);
                            }

                        });
                    let sql1 = 'delete from pos_entry';
                    connection.query(sql1, (err, rows) => {

                            if(!err){
                            console.log("Data Saved")
                            }
                            else{
                            console.log(err);
                            }
          
                        console.log('data from table: \n', rows);
                    });
        });
            
        pool.getConnection((err, connection) => {
            if(err) throw err;
            console.log('connected as ID' + connection.threadId);
            // use connection
            let sql2 = 'SELECT * FROM pos_entry';
            connection.query(sql2, (err, rows) => {
                connection.release();
                if(!err){
                        res.redirect('/');
                }
                else{
                    console.log(err);
                }
                console.log('data from table: \n', rows);
            });
        });
     
    } 
    
    
else {


var { item_code, item_name, item_type, price, item_qnty} = req.body;
var sideData = [];
if (item_qnty == '')
{
    item_qnty = 1;
}

    // find if item already exists.
    pool.getConnection((err, connection) => {
        connection.query('SELECT itemCode FROM itemmaster WHERE itemCode = ?', [item_code], (err, rows) => {
                if(err)
                {
                    throw err;
    
                }
                else if (rows.length > 0)
                {
                    
                    let sql = 'CALL huron_db.pos_insert(?, ?, @item_name, @item_price, @item_qnty, @ittax, @itemtype);'
                   connection.query(sql, [item_code, item_qnty], (err, rows, fields) => {
  
                        if(!err){
                            rows.forEach(element => {
                                if(element.constructor == Array)
                                console.log(element[0].item_qnty);

                            });
                        }
                        else{
                            console.log(err);
                        }
                   });   
                   
                  connection.query('select * from pos_entry', (err, rows) => {

                    if(!err){

                        var amount = 0.0;
                         var qnty = 0.0;
                         var tax = 0.0;
                         var  netamount = 0.0;

                        for(var i = 0; i<rows.length; i++)
                         {

                                amount = amount + (rows[i].gross_amount);
                                qnty = qnty + (rows[i].item_qnty);
                                tax = tax + (rows[i].gst_charge);
                                netamount = netamount + (rows[i].net_amount);
                        }
 

                        res.render('home', {rows, 
                            posts: [{
                                    amount: amount.toFixed(2),
                                    qnty: qnty.toFixed(2),
                                    tax: tax.toFixed(2),
                                    netamount: netamount.toFixed(2)
                            }]
                           
                        });

                    }
                    else
                    {
                        console.log(err);
                    }

                   });
                }        
            
       });    
 
    });


}
}


// Adding new Item

exports.form = (req, res) => {
    //    res.render('item-master');
    
        pool.getConnection((err, connection) => {
            if(err) throw err;
            console.log('connected as ID' + connection.threadId);
            // use connection
            let sql = 'SELECT * FROM itemmaster';
            connection.query(sql, (err, rows) => {
                connection.release();
                if(!err){
                    res.renderPjax('item-master', {rows});
                }
                else{
                    console.log(err);
                }
                console.log('data from table: \n', rows);
           });
        });
    
    }

// get item to show the list of item


exports.showItem = (req, res) => {
    //    res.render('item-master');
    
        pool.getConnection((err, connection) => {
            if(err) throw err;
            console.log('connected as ID' + connection.threadId);
            // use connection
            let sql = 'SELECT * FROM itemmaster';
            connection.query(sql, (err, rows) => {
                connection.release();
                if(!err){
                    res.renderPjax('show-master', {rows});
                }
                else{
                    console.log(err);
                }
                console.log('data from table: \n', rows);
           });
        });
    
    }
// New verison of addItem and update Item with stored procedure

exports.updateItem = (req, res) => {
  
    const { item_code, item_qnty } = req.body;
   
    if(item_code === '' || item_qnty === '')
    {
        res.render("show-master", {alert: 'Please enter item code and quantity'});

    }
    else
    {

    
        // find if item already exists.
        pool.getConnection((err, connection) => {
            connection.query('SELECT itemCode, stockinhand FROM itemmaster WHERE itemCode = ?', [item_code], (err, rows) => {
                    if(err)
                    {
                        throw err;
        
                    }
                    else if (rows.length === 0 )
                    {
                               
                                res.render('show-master', {alert: 'Item does not exist'});
                    }
                    else {
                        var stockinhand = 0.0
                        
                        for(var i=0; i<rows.length; i++)
                        {
                            stockinhand = rows[i].stockinhand + parseFloat(item_qnty);

                        }


                        let sql = 'update itemmaster set stockinhand = ? where itemcode = ? ' ;
                        connection.query(sql, [stockinhand, item_code], (err, rows) => {
 
                            if(!err){
                                let sql = 'SELECT * FROM itemmaster';
                                connection.query(sql, (err, rows) => {
                                    connection.release();
                                    if(!err){
                                        
                                        res.renderPjax('show-master', {rows, alert: "Item Updated Successfully"});
                                    }
                                    else{
                                        console.log(err);
                                    }
                                    console.log('data from table: \n', rows);
                               });
                            }
                            else{
                                console.log(err);
                            }
                       });        
                    }        
                
           });    
     
        });
    }
    
}


// on submit button pos added to the database


// on submit button pos added to the database

exports.addItem = (req, res) => {

const { item_code, item_name, item_description, item_type, price, item_qnty} = req.body;

if (item_code === '' || item_name === '' || price === '' || item_qnty === '' )
{
    res.render('item-master', {alert: 'Please enter all required fields'});

}
else
{

    // find if item already exists.
    pool.getConnection((err, connection) => {
        connection.query('SELECT itemCode FROM itemmaster WHERE itemCode = ?', [item_code], (err, rows) => {
                if(err)
                {
                    throw err;
    
                }
                else if (rows.length > 0)
                {
                    return res.renderPjax('item-master', {alert: 'Item Already exist'});
                }
                else {
                    
                    let sql = 'INSERT INTO itemmaster SET itemCode = ?, itemName = ?, itemDescription = ?, sellPrice=?, stockInhand = ?, itemType=?';
                    connection.query(sql, [item_code, item_name, item_description, price, item_qnty, item_type], (err, rows) => {
                        if(!err){
                            let sql = 'SELECT * FROM itemmaster';
                            connection.query(sql, (err, rows) => {
                                connection.release();
                                if(!err){
                                    res.render('item-master', {rows, alert: "Item Added Successfully"});
                                }
                                else{
                                    console.log(err);
                                }
                                console.log('data from table: \n', rows);
                           });
                
                        }
                        else{
                            console.log(err);
                        }
                   });        
                }        
            
       });    
 
    });
}
}


// delete user

exports.delete = (req, res) => {
    //    res.render('edit-user');
    
    
    pool.getConnection((err, connection) => {
        if(err) throw err;
        console.log('connected as ID' + connection.threadId);
        // use connection
        let sql = 'DELETE FROM itemmaster WHERE itemID = ?';
        connection.query(sql, [req.params.itemID], (err, rows) => {
            connection.release();
            if(!err){
                let removedUser = encodeURIComponent('User successfully removed');
                res.redirect('/additem');
            }
            else{
                console.log(err);
            }
            console.log('data delete from table: \n', rows);
        });
    });
    }

    //pos item entry deletion

    exports.itemDelete = (req, res) => {
        //    res.render('edit-user');
        
        
        pool.getConnection((err, connection) => {
            if(err) throw err;
            console.log('connected as ID' + connection.threadId);
            // use connection
            let sql = 'DELETE FROM pos_entry WHERE itemID = ?';
            connection.query(sql, [req.params.itemID], (err, rows) => {
 //               connection.release();
                if(!err){

                    connection.query('select * from pos_entry', (err, rows) => {

                        if(!err){
                            var amount = 0.0;
                            var qnty = 0.0;
                            var tax = 0.0;
                            var  netamount = 0.0;
   
                           for(var i = 0; i<rows.length; i++)
                            {
   
                                   amount = amount + (rows[i].gross_amount);
                                   qnty = qnty + (rows[i].item_qnty);
                                   tax = tax + (rows[i].gst_charge);
                                   netamount = netamount + (rows[i].net_amount);
                           }
    
   
                           res.render('home', {rows, 
                               posts: [{
                                       amount: amount.toFixed(2),
                                       qnty: qnty.toFixed(2),
                                       tax: tax.toFixed(2),
                                       netamount: netamount.toFixed(2)
                               }]
                              
                           });
                        }
                        else
                        {
                            console.log(err);
                        }
    
                       });
                }
                else{
                    console.log(err);
                }
                console.log('data delete from table: \n', rows);
            });
        });
        }
    

/*
// Search Item with search text
exports.find = (req, res) => {


    pool.getConnection((err, connection) => {
        if(err) throw err;
        console.log('connected as ID' + connection.threadId);
        // use connection
        let searchItem = req.body.idSearch;
        let sql = 'SELECT * FROM usermanagement_tut WHERE first_name LIKE ? or last_name LIKE ?';
        connection.query(sql, ['%' + searchItem + '%', '%' + searchItem + '%'], (err, rows) => {
            connection.release();
            if(!err){
                res.render('home', {rows});
            }
            else{
                console.log(err);
            }
            console.log('data from table: \n', rows);
        });
    });
}


// add user form view

exports.form = (req, res) => {
    res.render('add-user');
}

// on submit button user added to the database
exports.adduser = (req, res) => {
//    res.render('add-user');

const { first_name, last_name, email, phone, comments} = req.body;

pool.getConnection((err, connection) => {
    if(err) throw err;
    console.log('connected as ID' + connection.threadId);
    // use connection
    let sql = 'INSERT INTO usermanagement_tut SET first_name = ?, last_name = ?, email = ?, phone=?, comments=?';
    connection.query(sql, [first_name, last_name, email, phone, comments], (err, rows) => {
        connection.release();
        if(!err){
            res.render('add-user', {alert: 'User Added Successfully.'});
        }
        else{
            console.log(err);
        }
    });
});

}
*/
// edit user

exports.edit_item = (req, res) => {
//    res.render('edit-user');


pool.getConnection((err, connection) => {
    if(err) throw err;
    console.log('connected as ID' + connection.threadId);
    // use connection
    let searchItem = req.body.idSearch;
    let sql = 'SELECT * FROM itemmaster WHERE itemId = ?';
    connection.query(sql, [req.params.itemID], (err, rows) => {
        connection.release();
        if(!err){
            res.render('edit-master', {rows});
        }
        else{
            console.log(err);
        }
        console.log('data from table: \n', rows);
    });
});
}


//update user
exports.edit_master = (req, res) => {
    //    res.render('add-user');
    
    const { item_code, item_name, item_description, item_type, price, item_qnty} = req.body;

    pool.getConnection((err, connection) => {
        if(err) throw err;
        console.log('connected as ID' + connection.threadId);
        // use connection
        let sql = 'update itemmaster SET itemName = ?, itemDescription = ?, sellPrice=?, stockInhand = ?, itemType=? where itemCode = ?';
        connection.query(sql, [item_name, item_description, price, item_qnty, item_type, item_code], (err, rows) => {
//            connection.release();
            if(!err){

                let sql = 'SELECT * FROM itemmaster';
                connection.query(sql, (err, rows) => {
                    connection.release();
                    if(!err){
                        res.render('item-master', {rows, alert: "Item Updated Successfully"});
                    }
                    else{
                        console.log(err);
                    }
                    console.log('data from table: \n', rows);
                });
            }
            else{
                console.log(err);
            }
        });
    });
    
    }
  /*  
// delete user

exports.delete = (req, res) => {
    //    res.render('edit-user');
    
    
    pool.getConnection((err, connection) => {
        if(err) throw err;
        console.log('connected as ID' + connection.threadId);
        // use connection
        let searchItem = req.body.idSearch;
        let sql = 'DELETE FROM usermanagement_tut WHERE id = ?';
        connection.query(sql, [req.params.id], (err, rows) => {
            connection.release();
            if(!err){
                let removedUser = encodeURIComponent('User successfully removed');
                res.redirect('/?removed='+removedUser);
            }
            else{
                console.log(err);
            }
            console.log('data from table: \n', rows);
        });
    });
    }

// view user

exports.viewuser = (req, res) => {


    pool.getConnection((err, connection) => {
        if(err) throw err;
        console.log('connected as ID' + connection.threadId);
        // use connection
        let searchItem = req.body.idSearch;
        let sql = 'SELECT * FROM usermanagement_tut WHERE id = ?';
        connection.query(sql, [req.params.id], (err, rows) => {
            connection.release();
            if(!err){
                res.render('view-user', {rows});
            }
            else{
                console.log(err);
            }
            console.log('data from table: \n', rows);
        });
    });
}
*/