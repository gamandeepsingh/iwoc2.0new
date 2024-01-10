const { Octokit } = require('octokit');
const User = require('./user');
require('dotenv').config();
const fs = require('fs');
const mongoose = require('mongoose');


const octokit = new Octokit({ auth: process.env.GIT_TOKEN });
mongoose.connect(process.env.DB_STRING, () => { console.log("Connected to MongoDB.") });


const addUser = async (data) => {
    data = data.split(",")
    resp = { status: 200, id: 5, title: "❌Error", message: "Try contacting team." };
    if(data.length === 1) return resp;
    const userGitProfile = data[1].split("/")[3];
    try{
        const profile = await octokit.request('GET /users/{username}', { username: userGitProfile });
        const userGit = await User.findOne({ username: profile.data.login });
        if (userGit) {
            console.log("user already exists", data[2]);
        }
        else{
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
                console.log("total users = ", u.length);
            }
            catch(e){
                console.log("error while entering data in db", data[0])
            }
        }
        return resp;
    }
    catch(e){
        console.log("error in fetching", data[1]);
    }
};

const data = fs.readFileSync('sample.csv', 'utf8').split("\n");
console.log("length = ", data.length);

const add = async(data) => {
    for (let i of data){
        await addUser(i)
    }
}

add(data)
