const mongoose = require('mongoose');

const postSchma = mongoose.Schema({
  title: {type: String, required: true },
  content: {type: String, required: true },
  likeCount: {type: Number, required: true },
  imagePath: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
});

module.exports = mongoose.model('Post', postSchma);
