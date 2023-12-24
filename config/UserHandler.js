const { Octokit } = require('octokit');
const User = require('./user');
const Event = require("./event");
require('dotenv').config();

const octokit = new Octokit({ auth: process.env.GIT_TOKEN });

let resp, profile;

const fetchProfile = async (data) => {
    try {
        profile = await octokit.request('GET /users/{username}', { username: data.git });
    } catch (e) {
        resp = {
            status: 404,
            id: 4,
            title: "❌Github ID not found!",
            message: "Please check your github username."
        }
    }
};

const enterUser = async (data) => {
    try{
        await User.create({
            name: data.name.trim(),
            email: data.email.trim(),
            libid: data.libid.trim(),
            phone: data.phone.trim(),
            userid: profile.data.id,
            displayname: profile.data.name,
            username: profile.data.login,
            avatarUrl: profile.data.avatar_url,
            profileUrl: profile.data.html_url,
            gitEmail: profile.data.email,
            bio: profile.data.bio,
            blog: profile.data.blog,
            publicRepo: profile.data.public_repos,
            followers: profile.data.followers,
            following: profile.data.following
        });
        resp = {
            status: 200,
            id: 1,
            title: "✅Registration Successfull!",
            message: "Let's make this winter hot!🔥"
        }
    } catch(e){
        resp = {
            status: 409,
            id: 3,
            title: "❌Internal Error Occured",
            message: "Try contacting team."
        }
    }
};

const addUser = async (data) => {
    resp = { status: 200, id: 5, title: "❌Error", message: "Try contacting team." };
    await fetchProfile(data);
    if (resp.status == 404)return resp;
    const userGit = await User.findOne({ userid: profile.data.id });
    const userLib = await User.findOne({ libid: data.libid.trim() });
    if (userGit || userLib) {
        resp = {
            status: 409,
            id: 2,
            title: "❌User already exists!",
            message: "Try contacting team if you think this is a mistake."
        }
    }
    else await enterUser(data);
    return resp;
};

const enterEventUser = async (data) => {
    try{
        await Event.create({
            name: data.name.trim(),
            email: data.email.trim(),
            libid: data.libid.trim(),
            phone: data.phone.trim(),
            residence: data.residence.trim(),
        });
        resp = {
            status: 200,
            id: 1,
            title: "✅Registration Successfull!",
            message: "Let's make this winter hot!🔥"
        }
    } catch(e){
        resp = {
            status: 409,
            id: 3,
            title: "❌Internal Error Occured",
            message: "Try contacting team."
        }
    }
};

const addUserEvent = async (data) => {
    const userEmail = await Event.findOne({ email: data.email.trim() });
    const userLib = await Event.findOne({ libid: data.libid.trim() });
    const userPhone = await Event.findOne({ phone: data.phone.trim() });
    if (userEmail || userLib || userPhone) {
        resp = {
            status: 409,
            id: 2,
            title: "❌User already exists!",
            message: "Try contacting team if you think this is a mistake."
        }
    }
    else await enterEventUser(data);
    return resp;
};

module.exports = { addUser, addUserEvent };