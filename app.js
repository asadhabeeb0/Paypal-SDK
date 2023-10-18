require('dotenv').config();
const express=require("express");
const ejs=require("ejs");
const paypal=require("paypal-rest-sdk");

paypal.configure({
    "mode":'sandbox',
    'client_id':process.env.PAYPAL_CLIENT_ID,
  'client_secret': process.env.PAYPAL_CLIENT_SECRET
})

const app=express();
const port = process.env.PORT || 4000;

app.set('view engine','ejs');
app.use(express.urlencoded({ extended: false }));

app.get('/', (req,res) => res.render('index'))

app.post('/pay', (req,res) => {
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:4000/success",
            "cancel_url": "http://localhost:4000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Cocomo",
                    "sku": "001",
                    "price": "25.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "25.00"
            },
            "description": "Cocomo for Class"
        }]
    };
    
    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
          throw error;
      } else {
          for(let i = 0;i < payment.links.length;i++){
            if(payment.links[i].rel === 'approval_url'){
              res.redirect(payment.links[i].href);
            }
          }
      }
    });
    
    });
    
    app.get('/success', (req, res) => {
      const payerId = req.query.PayerID;
      const paymentId = req.query.paymentId;
    
      const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "25.00"
            }
        }]
      };
    
      paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            // console.log(JSON.stringify(payment));
            res.send('Success');
        }
    });
    });
    
    app.get('/cancel', (req, res) => res.send('Cancelled'));
    

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  }); 