const paypal = require('paypal-rest-sdk');

paypal.configure({
  mode: 'sandbox',
  client_id:
    'Ac6Fbx2DdJ88_GLWZLtIWYkIiWmpOPjew9oLUxDRYcd1QN6wFq67L9hWBFLjCRHsejkhImPyiApN11z5',
  client_secret:
    'EEgwLhjbniDOmMAlHj44ujR_ntv-_LTb9gZwr5D24cwBH1N1QI-TCS06dXwfOwiHeJ-10z6aOpIe5Doz',
});

exports.initiatePayment = (req, res) => {
  const payment = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal',
    },
    redirect_urls: {
      return_url: 'http://localhost:3000/execute-payment',
      cancel_url: 'http://localhost:3001/cart',
    },
    transactions: [
      {
        amount: {
          total: '10.00',
          currency: 'USD',
        },
        description: 'Payment for your product or service',
      },
    ],
  };

  // Create a PayPal payment
  paypal.payment.create(payment, (error, pay) => {
    if (error) {
      res.sendStatus(500);
    } else {
      // Redirect the user to PayPal for approval
      for (let i = 0; i < pay.links.length; i += 1) {
        if (pay.links[i].rel === 'approval_url') {
          res.redirect(pay.links[i].href);
          break;
        }
      }
    }
  });
};

exports.executePayment = async (req, res) => {
  const { payerId } = req.body;
  const { paymentId } = req.body;
  const executePayment = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          total: '10.00',
          currency: 'USD',
        },
      },
    ],
  };
  paypal.payment.execute(paymentId, executePayment, (error) => {
    if (error) {
      res.sendStatus(500);
    } else {
      res.send('Payment successful!');
    }
  });
};

exports.cancelPayment = (req, res) => {
  res.send('Payment canceled.');
};
