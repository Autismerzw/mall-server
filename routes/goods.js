
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Goods = require('../models/goods');
var User  = require('../models/user')

mongoose.connect('mongodb://127.0.0.1:27017/mall');

mongoose.connection.on('connected', () => {
    console.log("mongodb connected success")
})

mongoose.connection.on('error', () => {
    console.log("mongodb connected fail")
})

mongoose.connection.on('disconnected', () => {
    console.log("mongodb connected disconnected")
})

router.get('/', (req, res, next) => {
    // 获取分页参数
    let page        = parseInt(req.param('page'));
    // 获取每页显示多少条数据
    let pageSize    = parseInt( req.param('pageSize'));
    // 计算查询时需要调过几条数据 
    let skip        = (page - 1) * pageSize;
    // 接收前端传来的排序参数 
    let sort        = parseInt(req.param('sort'));

    let priceL = parseInt(req.param('priceL'));
    let priceH = parseInt(req.param('priceH'));
    // 获取条件条件
    // var parame      = {
    //     salePrice: {
    //         $gt: priceL,
    //         $lte: priceH
    //     }
    // };
    var parame = {};
    if (priceL.toString() === "NaN") {
        parame = {}
    } else {
        parame = {
            salePrice: {
                $gt: priceL,
                $lte: priceH
            }
        }
    }
    
    let goodsModel  = Goods.find(parame).skip(skip).limit(pageSize);
    goodsModel.sort({'salePrice':sort})
    // 将数据库中的数据抛出
    goodsModel.exec((err, doc) => {
        if(err) {
            res.json({
                stetus: '1',
                msg: err.message
            })
        } else {
            res.json({
                stetus: '0',
                msg: '',
                result: {
                    count: doc.length,
                    list: doc
                }
            })
        }
    })
})

router.post('/addCart', (req, res, next) => {
    // let userId = req.body.userId
    let userId = "100000077";
    let productId = req.body.productId;
    User.findOne({userId : userId}, (err,userDoc) => {
        if (err) {
            res.json({
                status: 1,
                msg: err.message
            })
        } else {
            if (userDoc) {
                let goodItem = '';
                userDoc.cartList.forEach(item => {
                    if (item.productId == productId) {
                        goodItem = item;
                        item.productNum ++;
                    }
                });
                if (goodItem) {
                    userDoc.save((err, doc) => {
                        if (err) {
                            res.json({
                                status: '1',
                                msg: err.message
                            })
                        } else {
                            res.json({
                                status: '0',
                                msg: '',
                                result: 'succes'
                            })
                        }
                    })
                }else{
                    Goods.findOne({productId: productId}, (err,doc) => {
                        if (err) {
                            res.json({
                                status: 1,
                                msg: err1.message
                            })
                        } else {
                            if (doc) {
                                doc.productNum = 1;
                                doc.checked = 1;
                                userDoc.cartList.push(doc);
                                userDoc.save((err2, doc2) => {
                                    if (err2) {
                                        res.json({
                                            status: '1',
                                            msg: err1.message
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
                }
            }
        }
    })
    
})

module.exports = router;