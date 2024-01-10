const { Octokit } = require('octokit');
const User = require('./user');
require('dotenv').config();
const fs = require('fs');
const mongoose = require('mongoose');


const octokit = new Octokit({ auth: process.env.GIT_TOKEN });
mongoose.connect(process.env.DB_STRING, () => { console.log("Connected to MongoDB.") });


let userData, profile;

const fetchProfile = async (git) => {
    try {
        profile = await octokit.request('GET /users/{username}', { username: git });

    } catch (e) {
        resp = {
            message: "Please check your github username."
        }
    }
};

const enterUser = async (data) => {
    try{
        await User.create({
            name: data[0],
            email: data[2],
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
        const u = await User.find();
        console.log("user = ", u.length);
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
    data = data.split(",")
    resp = { status: 200, id: 5, title: "❌Error", message: "Try contacting team." };
    if(data.length === 1) return resp;
    const userGitProfile = data[1].split("/")[3];
    await fetchProfile(userGitProfile);
    const userGit = await User.findOne({ username: profile.data.login });
    if (userGit) {
        console.log(data[2]);
        resp = {
            message: "❌User already exists!",
        }
    }
    else await enterUser(data);
    return resp;
};

const data = fs.readFileSync('sample.csv', 'utf8').split("\n");
console.log("length = ", data.length);
for (let i of data){
    addUser(i)
}
