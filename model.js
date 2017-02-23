/**
 * Created by Kathy on 2017/2/4.
 * 1.引用mongoose
 * 2.建立连接
 * 3.schema
 * 4.导出
 */
let mongoose=require('mongoose');
mongoose.connect('mongodb://localhost/201702chat');
let MessageSchema=new mongoose.Schema({
    username:String,
    content:String,
    createAt:{type:Date,default:Date.now} //发言时间
});

exports.Message=mongoose.model('Message',MessageSchema);