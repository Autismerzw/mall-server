
var express = require('express');
var router = express.Router();
require('../util/util')

var User = require('./../models/user.js')
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
// 用户登录
router.post('/login', (req, res, next) => {
  var param = {
    userName: req.body.userName,
    userPwd: req.body.userPwd
  }
  console.log(param)
  User.findOne(param, (err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message
      })
    } else {
      if (doc) {
        res.cookie('userId', doc.userId, {
          path: '/',
          maxAge: 1000 * 60 * 60 * 24
        })
        res.cookie('userName', doc.userName, {
          path: '/',
          maxAge: 1000 * 60 * 60 * 24
        })
        res.json({
          status: '0',
          msg: '',
          result: {
            userName: doc.userName
          }
        })
      } else {
        res.json({
          status: '2'
        })
      }
    }
  })
})
// 用户退出
router.post('/logout', (req, res, next) => {
  res.cookie('userId', '', {
    path: '/',
    maxAge: 0
  })
  res.json({
    status: '0',
    msg: '',
    result: ''
  })
})
// 检测登录状态
router.get('/checkLogin', (req, res, next) => {
  if (req.cookies.userId) {
    res.json({
      status: '0',
      msg: '',
      result: req.cookies.userName
    })
  } else {
    res.json({
      status: '1',
      msg: '未登录',
      result: ''
    })
  }
})
// 获取购物车列表
router.get('/cartList', (req, res, next) => {
  let userId = req.cookies.userId
  User.findOne({userId: userId}, (err, doc) => {

    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      if (doc) {
        res.json({
          status: '0',
          msg: '',
          result: doc.cartList
        })
      }
    }
  })
})
// 删除购物车商品
router.post('/cartDel', (req, res, next) => {
  let userId = req.cookies.userId
  let productId = req.body.productId
  User.update({ 
    userId: userId 
  }, { 
    $pull: { 
      'cartList': { 
        'productId': productId
      }
    }
  }, (err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      res.json({
        status: '0',
        msg: '',
        result: 'suc'
      })
    }
  })
})
// 修改商品数量
router.post('/cartEdit', (req, res, next) => {
  let userId = req.cookies.userId,
  productId = req.body.productId,
  productNum = req.body.productNum,
  checked = req.body.checked;
  User.update({'userId': userId, 'cartList.productId':productId}, {
    'cartList.$.productNum': productNum,
    'cartList.$.checked': checked
  }, (err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      res.json({
        status: '0',
        msg: '',
        result: 'suc'
      })
    }
  })
})
// 全选状态更改
router.post('/editCheckAll', (req, res, next) => {
  let userId = req.cookies.userId,
      checkedAll = req.body.checkAll ? 1 : 0;
  User.findOne({userId: userId}, (err, user) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: '' 
      })
    } else {
      if (user) {
        user.cartList.forEach(item => {
          item.checked = checkedAll
        });
        user.save((err1, doc) => {
          if (err1) {
            res.json({
              status: '1',
              msg: err.message,
              result: ''
            })
          } else {
            res.json({
              status: '0',
              msg: '',
              result: 'suc'
            })
          }
        })
      }
    }
  })

})
// 获取收货地址接口
router.get('/addressList', (req, res, next) => {
  var userId = req.cookies.userId
  User.findOne({userId: userId}, (err,doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      if (doc) {
        res.json({
          status: '0',
          msg: '',
          result: doc.addressList
        })
      }
    }
  })
})
// 更改默认收货地址
router.post('/isDefault', (req, res, next) => {
  let userId = req.cookies.userId
  let addressId = req.body.addressId
  if (!addressId) {
    res.json({
      status: '1003',
      msg: 'addressId is null',
      result: ''
    })
  } else {
    User.findOne({userId: userId}, (err, doc) => {
      if (err) {
        res.json({
          status: '1',
          msg: err.message,
          result: ''
        })
      } else {
        var addressList = doc.addressList
        addressList.forEach(item => {
          if (item.addressId == addressId) {
            item.isDefault = true
          } else {
            item.isDefault = false
          }
        });
        doc.save((err1, doc1) => {
          if (err1) {
            res.json({
              status: '1',
              msg: err.message,
              result: ''
            })
          } else {
            res.json({
              status: '0',
              mag: '',
              result: 'suc'
            })
          }
        })
      }
    })
  }
})
// 删除收货地址
router.post('/delAddress', (req, res, next) => {
  let userId    = req.cookies.userId,
      addressId = req.body.addressId;
  User.update({userId: userId},{
    $pull: {
      'addressList': {
        'addressId': addressId
      }
    }
  }, (err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      res.json({
        status: '0',
        msg: '',
        result: 'suc'
      })
    }
  })
})
// 提交订单
router.post('/payMent', (req, res, next) => {
  let userId = req.cookies.userId,
  addressId = req.body.addressId,
  orderTotal = req.body.orderTotal;
  User.findOne({userId: userId}, (err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      // 获取当前用户的地址信息
      var address = '';
      doc.addressList.forEach(item => {
        if (item.addressId === addressId) {
          address = item
        }
      })
      // 获取用户的购买商品列表
      var goodList = [];
      doc.cartList.forEach(item => {
        if (item.checked === 1) {
          goodList.push(item)
        }
      })
      var sysDate = new Date().Format('yyyyMMddhhmmss')
      var createDate = new Date().Format('yyyy-MM-dd hh:mm:ss')
      var r1 = Math.floor(Math.random()*10)
      var r2 = Math.floor(Math.random()*10)
      var platform = '577'
      var orderId = platform + r1 + sysDate + r2
      var order = {
        orderId: orderId,
        orderTotal: orderTotal,
        addressInfo: address,
        goodList: goodList,
        orderStatus: '101',
        createDate: createDate
      }

      doc.orderList.push(order);
      doc.save((err1, doc1) => {
         if (err1) {
           res.json({
             status: '1',
             msg: err1.message,
             result: ''
           })
         } else {
           res.json({
             status: '0',
             err: '',
             result: {
               orderId: order.orderId,
               orderTotal: order.orderTotal
             }
           })
         }
      })
    }
  })
})
// 查询订单
router.get('/orderConfirm', (req, res, next) => {
  let userId = req.cookies.userId,
    orderId = req.param('orderId');
      User.findOne({userId: userId}, (err, userInfo) => {
        if (err) {
          res.json({
            status: '1',
            mag: err.message,
            result: ''
          })
        } else {
          var orderList = userInfo.orderList
          var orderTotal = 0
          if (orderList.length > 0) {
            orderList.forEach(item => {
              if (item.orderId === orderId) {
                orderTotal = item.orderTotal
              } 
              if (orderTotal > 0) {
                res.json({
                  status: '0',
                  msg: '',
                  result: {
                    orderId: orderId,
                    orderTotal: orderTotal
                  }
                })
              } else {
                res.json({
                  status: '12002',
                  msg: '查无此单',
                  result: ''
                })
              }
            })
          } else {
            res.json({
              status: '12001',
              msg: '该用户还没有下单',
              result: ''
            })
          }
        }
      })
})
module.exports = router;
