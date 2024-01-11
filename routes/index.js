const express = require("express");
const passport = require("passport");
const path = require("path");
const User = require("../config/user");
const ProjectHandler = require("../config/ProjectHandler");
const UserHandler = require("../config/UserHandler");
const Project = require("../config/project")
const Admin = require("../config/admin");

const router = express.Router();

const validateData = async (data) => {
  var regExp = /[0-9]/;
  if (data.name == '' || data.name == null || regExp.test(data.name)) return false;
  var chkExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (data.email == '' || data.email == null || !chkExp.test(data.email)) return false;
  // if (data.libid == '' || data.libid == null)  return false;
  regExp = /[a-zA-Z]/g;
  if (data.phone == '' || data.phone == null || regExp.test(data.phone) || data.phone.length != 10) return false;
  if (data.git == '' || data.git == null) return false;
  return true;
}

// **************************BASE ROUTES **********************************

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../pages/landing.html"));
});

// *************************** --------------------------- ******************


// ********************* USER RELATED ROUTES ************************************

const Registered = async (id) => {
  const user = await User.findById(id);
  if (user.email) return true;
  return false;
}

const Exists = async (id) => {
  const user = await User.findById(id);
  if (user !== null) return true;
  return false;
}

// router.get("/register",
//   async (req, res, next) => {
//     if (req.session.passport && (await Exists(req.session.passport.user))) next();
//     else res.sendFile(path.join(__dirname, "../pages/form.html"));
//   },
//   async (req, res, next) => {
//     if (await Registered(req.session.passport.user)) res.redirect("/dashboard");
//     else next();
//   },
//   (req, res, next) => {
//     res.sendFile(path.join(__dirname, "../pages/form.html"));
//   }
// );

// router.post("/register",
//   async (req, res) => {
//     if(validateData(req.body)){
//       const resp = await UserHandler.addUser(req.body);
//       res.send(JSON.stringify(resp));
//     }
//     else{
//       const resp = {message: "Invalid Data"};
//       res.send(JSON.stringify(resp));
//     } 
//   }
// );

router.get("/login",
  async (req, res, next) => {
    if (req.session.passport && (await Exists(req.session.passport.user))) next();
    else res.sendFile(path.join(__dirname, "../pages/login.html"));
  },
  async (req, res, next) => {
    if (await Registered(req.session.passport.user)) res.redirect("/dashboard");
    else next();
  },
  (req, res, next) => {
    res.sendFile(path.join(__dirname, "../pages/login.html"));
  }
);

router.get("/dashboard",
  async (req, res, next) => {
    if (req.session.passport && (await Exists(req.session.passport.user))) next();
    else res.redirect("/login");
  }, 
  async (req, res, next) => {
    if (await Registered(req.session.passport.user)) next();
    else{
      await User.deleteOne({_id:req.session.passport.user});
      res.redirect("/unauthenticated"); 
    } 
  },
  async (req, res, next) => {
    const user = await User.findById(req.session.passport.user);
    res.render("dashboard", { user: user });
  }
);

router.get("/dashboard/leaderboard",
  async (req, res, next) => {
    if (req.session.passport && (await Exists(req.session.passport.user))) next();
    else res.redirect("/login");
  },
  async (req, res, next) => {
    if (await Registered(req.session.passport.user)) next();
    else{
      await User.deleteOne({_id:req.session.passport.user});
      res.redirect("/unauthenticated");
    } 
  },
  async (req, res, next) => {
    const user_t = await User.findById(req.session.passport.user);
    const users = await User.find();
    await users.sort(function(a, b){return b.score - a.score});
    const rank = users.map(e => e.username).indexOf(user_t.username) + 1;
    if(req.query.user){
      const user = await User.findOne({username:req.query.user});
      res.render("history", { user_t:user_t,user: user,rank:rank });
    }
    else res.render("leaderboard", { user: user_t,users: users, rank:rank});
  }
);

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

router.get("/unauthenticated", async (req, res, next) => {
  res.sendFile(path.join(__dirname, "../pages/unauthenticated.html"));
});

// // ************************ --------------------- *********************************


// // ************************ EVENT ROUTES *******************************************

// router.get("/eventRegistration", (req, res) => {
//   res.sendFile(path.join(__dirname, "../pages/event_registration.html"));
// });

// router.post("/eventRegistration",
//   async (req, res) => {
//     if(validateData(req.body)){
//       const resp = await UserHandler.addUserEvent(req.body);
//       res.send(JSON.stringify(resp));
//     }
//     else{
//       const resp = {message: "Invalid Data"};
//       res.send(JSON.stringify(resp));
//     } 
//   }
// );

// // ************************ -------------------------- *****************************


// // ************************ PROJECT RELATED ROUTES *********************************

router.get("/projects", async (req, res, next) => {
  const projects = await Project.find();
  res.render("project", {project : projects});
});

// router.post("/register-project",
//   async (req, res, next) => {
//     await ProjectHandler.addProject(req.body);
//   }, (req, res) => {
//     res.send("Done");
//   }
// );

// // OR
// // OR

// router.get("/submit-project", (req, res) => {
//     res.redirect("https://forms.gle/zhrY8EvbFZCty1tw9");
//   }
// );
// router.get("/submit-project", (req, res) => {
//     res.redirect("https://forms.gle/zhrY8EvbFZCty1tw9");
//   }
// );

// // ************************ ---------------------- *********************************


// // ********'Github Oauth' routes for PassportJS github strategy and verification callbacks.*************

router.get("/auth/github", (req, res, next) => next(),
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get('/auth/github/callback',
  (req, res, next) => {
    passport.authenticate('github', { failureRedirect: '/login' })(req, res, (err) => {
      if (err) {
        // Log the failure reason
        return res.redirect('/failure?reason=' + encodeURIComponent(err.message));
      }
      // Successful authentication logic
      async function success() {
            const user = await User.findById(req.session.passport.user);
            const d = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
            user.sessions.push({ sessionid: req.sessionID, date: d });
            await user.save();
            res.redirect("/dashboard");
          }
      success();
    });
  });

// // ***********************----------------------------***************************************


// // *********************** ADMIN ROUTES *****************************************************

// async function adminExists(adminid) {
//   const admin = await Admin.findById(adminid);
//   return admin !== null;
// }

// router.get("/admin-register",
//   async (req, res, next) => {
//     if (req.session.passport && (await adminExists(req.session.passport.user))) res.redirect("/dashboard");
//     else next();
//   },
//   (req, res, next) => {
//     res.sendFile(path.join(__dirname, "../pages/admin-register.html"));
//   }
// );

// router.post("/admin-register", (req, res, next) => {
//   const newAdmin = new Admin({
//     adminname: req.body.name,
//     email: req.body.email,
//     sessionid: req.sessionID,
//     hash: req.body.password,
//     role: req.body.role,
//   });
//   newAdmin.save()
//   res.redirect("/admin");
// });

// **********************************************-------------------------------------------************************


// ********************************* ERROR RELATED ROUTES **********************************

router.get("/maintenance", (req, res) => {
  res.sendFile(path.join(__dirname, "../pages/maintenance.html"));
});

router.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../pages/404.html"));
})

// ********************************* --------------------- *********************************


module.exports = router;