const UsersModel = require("../models/users.model");
const { to, isNull, ReE, ReS } = require("../services/util.services");
const HttpStatus = require("http-status");
const { ObjectId } = require("mongoose").Types;
var validator = require("validator");
const CONFIG = require("../config/config");
const { isEmail, isMobilePhone } = validator;

const createUser = async function (req, res) {
  /**
   * This Function is used to Register a user
   */
  let err, user;
  if (isNull(req.body.email) || !isEmail(req.body.email))
    return ReE(
      res,
      { message: "Valid email required", success: false, err },
      400
    );
  if (isNull(req.body.phone) || !isMobilePhone(req.body.phone))
    return ReE(
      res,
      { message: "Valid phone required", success: false, err },
      400
    );

  [err, user] = await to(
    UsersModel.findOne({ email: { $regex: req.body.email, $options: "i" } })
  );

  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  }
  if (!user) {
    [err, user] = await to(UsersModel.create(req.body));
    if (err) {
      return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    } else {
      return ReS(
        res,
        { message: "User registered sucessfully.", user: user },
        HttpStatus.OK
      );
    }
  } else if (!user.active) {
    user.active = true;
    [err, user] = await user.save();
    if (err) {
      return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return ReS(
      res,
      { message: "User registered sucessfully.", user: user },
      HttpStatus.OK
    );
  } else {
    return ReE(
      res,
      { message: "User already registered." },
      HttpStatus.BAD_REQUEST
    );
  }
};
module.exports.createUser = createUser;

const login = async function (req, res) {
  /**
   * This Function is used to Login a user
   */
  let body = req.body;
  if (isNull(body.email))
    return ReE(
      res,
      { message: "Please provide a valid email", success: false },
      HttpStatus.BAD_REQUEST
    );
  else if (isNull(body.password))
    return ReE(
      res,
      { message: "Please enter a password to login", success: false },
      HttpStatus.BAD_REQUEST
    );
  else {
    let query = {
      email: { $regex: body.email, $options: "i" },
      active: true,
    };
    let err, user;

    [err, user] = await to(UsersModel.findOne(query));

    if (err)
      return ReE(res, {
        message: "Auth failed. please contact support",
      });

    if (!user)
      return ReE(
        res,
        { message: "Invalid email or password", success: false, err },
        400
      );
    if (user) {
      [err, user] = await to(user.comparePassword(body.password));

      if (err) {
        console.log(err);
        return ReE(
          res,
          { message: "Invalid email or password", success: false, err },
          400
        );
      }
      if (user != null) {
        let token = user.getJWT();
        return ReS(res, {
          message: "Logged in successfully",
          token: token,
          user: user,
          success: true,
        });
      } else {
        return ReE(
          res,
          {
            message: "Invalid email or password ",
            success: true,
            err,
          },
          400
        );
      }
    }
  }
};

module.exports.login = login;

const adminLogin = async function (req, res) {
  /**
   * This Function is used to Login as an admin
   */
  let body = req.body;
  if (isNull(body.email))
    return ReE(
      res,
      { message: "Please provide a valid email", success: false },
      HttpStatus.BAD_REQUEST
    );
  else if (isNull(body.password))
    return ReE(
      res,
      { message: "Please enter a password to login", success: false },
      HttpStatus.BAD_REQUEST
    );
  else {
    let query = {
      email: { $regex: body.email, $options: "i" },
      active: true,
      role: "admin",
    };
    let user;

    [err, user] = await to(UsersModel.findOne(query));

    if (err)
      return ReE(res, {
        message: "Auth failed. please contact support",
      });

    if (!user)
      return ReE(
        res,
        { message: "Invalid email or password", success: false, err },
        400
      );
    if (user) {
      [err, user] = await to(user.comparePassword(body.password));

      if (err) {
        console.log(err);
        return ReE(
          res,
          { message: "Invalid email or password", success: false, err },
          400
        );
      }
      if (user != null) {
        let token = user.getJWT();
        return ReS(res, {
          message: "Logged in successfully",
          token: token,
          user: user,
          success: true,
        });
      } else {
        return ReE(
          res,
          {
            message: "Invalid email or password ",
            success: true,
            err,
          },
          400
        );
      }
    }
  }
};

module.exports.adminLogin = adminLogin;

const getUser = async function (req, res) {
  return ReS(res, { user: req.user }, HttpStatus.OK);
};

module.exports.getUser = getUser;

const getUserById = async function (req, res) {
  /**
   * 
   * This API is used to get specified user details
     based on the id generated during registration
   *@ params - id - user id   
   */

  const id = req.params.id;

  let query = {
    active: true,
    _id: new ObjectId(id),
  };

  let err, user;
  [err, user] = await to(UsersModel.findOne(query));

  if (err) {
    return ReE(res, err, HttpStatus.BAD_REQUEST);
  } else {
    if (isNull(user)) {
      return ReE(
        res,
        {
          user: "No user found",
        },
        HttpStatus.NOT_FOUND
      );
    } else {
      return ReS(
        res,
        {
          user: user,
        },
        HttpStatus.OK
      );
    }
  }
};

module.exports.getUserById = getUserById;

const getAllUsers = async function (req, res) {
  /**
 * This API is used to get list of all registered 
   active user to be displayed in admin platform.
 */
  let query;
  let page = req.body.page || 1;
  let limit = req.body.limit || 10;
  let search = req.body.search;
  let sort = req.body.sort;
  let body = req.body;
  let filter = req.body.filter;
  let searchFields = [];
  let options = {
    page: page,
    limit: limit,
    lean: true,
  };
  if (sort) {
    options.sort = body.sort;
  }
  if (search) {
    searchFields = [
      {
        firstName: {
          $regex: search,
          $options: "i",
        },
      },
      {
        lastName: {
          $regex: search,
          $options: "i",
        },
      },
      {
        email: {
          $regex: search,
          $options: "i",
        },
      },
    ];

    query = {
      active: true,
      $or: searchFields,
      ...filter,
    };
  } else {
    query = {
      active: true,
      ...filter,
    };
  }

  let err, user;
  [err, user] = await to(UsersModel.paginate(query, options));

  if (err) {
    return ReE(res, err, HttpStatus.BAD_REQUEST);
  } else {
    return ReS(
      res,
      {
        user: user,
      },
      HttpStatus.OK
    );
  }
};

module.exports.getAllUsers = getAllUsers;

const getAllUsersWithoutPagination = async function (req, res) {
  /**
 * This API is used to get list of all registered 
   active user to be displayed in admin platform.
 
 */

  let query = {
    active: true,
  };

  let err, user;
  [err, user] = await to(
    UsersModel.find(query).sort({
      createdAt: -1,
    })
  );

  if (err) {
    return ReE(res, err, HttpStatus.BAD_REQUEST);
  } else {
    return ReS(
      res,
      {
        user: user,
      },
      HttpStatus.OK
    );
  }
};

module.exports.getAllUsersWithoutPagination = getAllUsersWithoutPagination;

const updateUser = async function (req, res) {
  /**
   * This API is used to update user's data for given user id
   
   *@ Params - id - user id to be updated.   
   */
  let err, updateUser, data;
  data = req.body;
  let id = req.params.id;
  let user = req.user;

  if (!isNull(data?.role) || data?.permissions?.length > 0) {
    if (user?.role !== "admin") {
      return ReE(
        res,
        {
          message: "Only admin can update or assign roles for the users.",
          success: false,
        },
        HttpStatus.BAD_REQUEST
      );
    } else {
      if (!isNull(data?.role)) {
        const isContainsValidRole = data.role.every((item) =>
          CONFIG.user_roles.includes(item)
        );

        if (!isContainsValidRole) {
          return ReE(res, { message: "Please select a valid roles" });
        }
      }

      if (!isNull(data?.permissions)) {
        const isContainsValidPermissions = data.permissions.every((item) =>
          CONFIG.user_permissions.includes(item)
        );

        if (!isContainsValidPermissions) {
          return ReE(res, { message: "Please select a valid permissions" });
        }
      }
    }
  }

  let query = {
    active: true,
    _id: new ObjectId(id),
  };

  [err, updateUser] = await to(UsersModel.findOneAndUpdate(query, data));

  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  } else {
    [err, updateUser] = await to(UsersModel.findOne(query));
    return ReS(res, { user: updateUser }, HttpStatus.OK);
  }
};
module.exports.updateUser = updateUser;

const deleteUser = async function (req, res) {
  /**
   * This API is used to delete user's data for given user id
   *@ Params - id - user id to be deleted.
   */
  const id = req.params.id;
  let err, user;

  let data = {
    active: false,
  };

  let query = {
    _id: new ObjectId(id),
  };
  [err, user] = await to(UsersModel.findOneAndUpdate(query, data));

  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  return ReS(
    res,
    {
      message: "User deleted successfully",
    },
    HttpStatus.OK
  );
};

module.exports.deleteUser = deleteUser;
