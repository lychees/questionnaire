var path = require('path');
var moment = require('moment');
var async = require('async');
var _ = require('underscore');
var Questionnaire = require('../models/questionnaire');
var Question = require('../models/question');
var Option = require('../models/option');

exports.listPage = function (req, res) {
    res.sendFile(path.join(__dirname, '../client/manage/index.html'));
};

exports.addPage = function (req, res) {
    res.sendFile(path.join(__dirname, '../client/manage/add_questionnaire.html'));
};

exports.editPage = function (req, res) {
    res.sendFile(path.join(__dirname, '../client/manage/edit_questionnaire.html'));
};

exports.add = function (req, res, next) {
    var questionnaire = new Questionnaire(req.body);
    questionnaire.save(function (err) {
        if (err) {
            return res.json({
                success: false,
                error: err.message
            });
        }
        res.json({
            success: true
        });
    });
};

exports.list = function (req, res) {
    Questionnaire.find()
        .select('title questions isPublished publishAt deadline')
        .exec(function (err, questionnaires) {
            if (err) {
                return res.json({
                    success: false,
                    error: err.message
                });
            }
            res.json({
                success: true,
                questionnaires: questionnaires
            });
        });
};

exports.detail = function (req, res) {
    var questionnaireId = req.params.questionnaire;
    async.parallel([
        function (callback) {
            Questionnaire.findById(questionnaireId)
                .select('title type questions isPublished deadline')
                .exec(function (err, questionnaire) {
                    callback(err, questionnaire);
                });
        },
        function (callback) {
            Question.find().select('content type')
                .exec(callback);
        }
    ], function (err, results) {
        if (err) {
            return res.json({
                success: false,
                error: err.message
            });
        }
        var questionnaire = results[0];
        if (!questionnaire) {
            return res.json({
                success: false,
                error: 'Questionnaire not found'
            });
        }
        res.json({
            success: true,
            questionnaire: questionnaire,
            questions: results[1]
        });
    });
};

exports.edit = function (req, res) {
    var questionnaire = req.body.questionnaire;
    Questionnaire.findById(questionnaire._id)
        .exec(function (err, _questionnaire) {
            if (err) {
                return res.json({
                    success: false,
                    error: err.message
                });
            }
            if (!_questionnaire) {
                return res.json({
                    success: false,
                    error: 'Questionnaire not found'
                });
            }
            var newQuestionnaire = _.extend(_questionnaire, questionnaire);
            newQuestionnaire.save(function (err) {
                if (err) {
                    return res.json({
                        success: false,
                        error: err.message
                    });
                }
                res.json({
                    success: true
                })
            })
        });
};

exports.publish = function (req, res) {
    var questionnaire = req.body.questionnaire;
    Questionnaire.findById(questionnaire._id)
        .exec(function (err, _questionnaire) {
            if (err) {
                return res.json({
                    success: false,
                    error: err.message
                });
            }
            if (!_questionnaire) {
                return res.json({
                    success: false,
                    error: 'Questionnaire not found'
                });
            }
            var newQuestionnaire = _.extend(_questionnaire, questionnaire);
            newQuestionnaire.save(function (err) {
                if (err) {
                    return res.json({
                        success: false,
                        error: err.message
                    });
                }
                res.json({
                    success: true
                })
            })
        });
};

exports.delete = function (req, res) {
    var questionnaireId = req.params.questionnaire;
    Questionnaire.findByIdAndRemove(questionnaireId, function (err, questionnaire) {
        if (err) {
            return res.json({
                success: false,
                error: err.message
            });
        }
        if (!questionnaire) {
            return res.json({
                success: false,
                error: 'Questionnaire not found'
            });
        }
        res.json({
            success: true
        });
    });
};

exports.indexPage = function (req, res) {
    res.sendFile(path.join(__dirname, '../client/app/index.html'));
};

exports.indexData = function (req, res) {
    var questionnaireId = req.params.questionnaire;
    Questionnaire.findById(questionnaireId)
        .select('title questions')
        .populate({
            path: 'questions',
            select: 'content type'
        })
        .exec(function (err, questionaire) {
            async.map(questionaire.questions, function (question, callback) {
                Option.find({question: question._id})
                    .select('content')
                    .exec(function (err, options) {
                        var _question = {
                            _id: question._id,
                            content: question.content,
                            type: question.type,
                            options: options
                        };
                        callback(err, _question);
                    })
            }, function (err, results) {
                if (err) {
                    return res.json({
                        success: false,
                        error: err.message
                    })
                }
                res.json({
                    success: true,
                    title: questionaire.title,
                    questions: results
                });
            });
        });
};

exports.submit = function (req, res) {
    var questionnaire = req.params.questionnaire;
    var answer = req.body.answer;
};