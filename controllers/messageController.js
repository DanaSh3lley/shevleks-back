const Message = require('../models/messageModel');

exports.createMessage = async (req, res, next) => {
    const {receiver, message} = req.body;
    const sender = req.user.role === 'admin' ? 'admin' : req.user.id; // Set sender as 'admin' if user role is admin

    try {
        const newMessage = await Message.create({
            sender,
            receiver,
            message,
        });

        res.status(201).json({
            status: 'success',
            data: {
                message: newMessage,
            },
        });
    } catch (error) {
        next(error);
    }
};

exports.getUserMessages = async (req, res, next) => {
    const userId = req.user.id; // Assuming the user's ID is available in req.user

    try {
        const messages = await Message.find({receiver: userId});

        res.status(200).json({
            status: 'success',
            data: {
                messages,
            },
        });
    } catch (error) {
        next(error);
    }
};

exports.getMessages = async (req, res) => {
    try {
        let messages;
        const isAdmin = req.user.role === 'admin';
        const userId = req.user._id;

        if (isAdmin) {
            messages = await Message.aggregate([
                {
                    $match: {
                        $or: [{sender: 'admin'}, {receiver: 'admin'}],
                    },
                },
                {
                    $group: {
                        _id: {
                            $cond: {
                                if: {$eq: ['$sender', 'admin']},
                                then: '$receiver',
                                else: '$sender',
                            },
                        },
                        messages: {$push: '$$ROOT'},
                    },
                },
            ]);

            await Message.populate(messages, {path: '_id', model: 'User', select: 'name'});

        } else {
            messages = await Message.aggregate([
                {
                    $match: {
                        $or: [
                            {sender: userId.toString()},
                            {receiver: userId.toString()},
                        ],
                    },
                },
                {
                    $group: {
                        _id: {
                            $cond: {
                                if: {$eq: ['$sender', userId.toString()]},
                                then: '$receiver',
                                else: '$sender',
                            },
                        },
                        messages: {$push: '$$ROOT'},
                    },
                },
            ]);
            messages.forEach((dialogue) => {
                dialogue._id = {_id: 'admin', name: 'Admin'};
            });

        }

        res.status(200).json({
            status: 'success',
            data: {
                messages: messages.map((dialogue) => ({
                    _id: dialogue._id._id,
                    name: dialogue._id.name,
                    messages: dialogue.messages.map((message) => ({
                        _id: message._id,
                        sender: message.sender,
                        receiver: message.receiver,
                        message: message.message,
                        createdAt: message.createdAt,
                    })),
                })),
            },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch messages',
        });
    }
};


