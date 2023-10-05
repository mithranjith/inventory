const { Category } = require("../models");
const { to, ReS, ReE } = require("../services/util.services");
const HttpStatus = require("http-status");
const { ObjectId } = require("mongoose").Types;

const createCategory = async function (req, res) {
  const body = req.body;

  let err, category;

  [err, category] = await to(Category.create(body));

  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  } else {
    return ReS(
      res,
      { message: "Category Added.", category: category },
      HttpStatus.OK
    );
  }
};
module.exports.createCategory = createCategory;

const getAllCategories = async function (req, res) {
  let page = req.query.page || 1;
  let limit = req.query.limit || 50;

  let options = {
    page: page,
    limit: limit,
    lean: true,
    sort: {
      timestamp: "desc",
    },
    //populate: "subCategory",
  };

  var query = [
    {
      $match: {
        active: true,
      },
    },
  ];
  let err, category;

  //[err, category] = await to(Category.paginate(query, options));
  [err, category] = await to(
    Category.aggregatePaginate(Category.aggregate(query), options)
  );
  if (err) {
    return ReE(res, err, HttpStatus.BAD_REQUEST);
  }
  return ReS(
    res,
    {
      category: category,
    },
    HttpStatus.OK
  );
};
module.exports.getAllCategories = getAllCategories;

const getAllListCategories = async function (req, res) {
  let page = req.body.page || 1;
  let limit = req.body.limit || 50;
  let options = {
    page: page,
    limit: limit,
    lean: true,
  };
  query = [
    {
      $match: {
        parent: null,
        active: true,
      },
    },
    {
      $graphLookup: {
        from: "categories",
        startWith: "$_id",
        connectFromField: "_id",
        connectToField: "parent",
        as: "subCategories",
        maxDepth: 100,
        depthField: "level",
        restrictSearchWithMatch: { active: true, enable: true },
      },
    },
    {
      $addFields: {
        subCategories: {
          $map: {
            input: "$subCategories",
            as: "sc1",
            in: {
              $mergeObjects: [
                "$$sc1",
                {
                  subCategories: {
                    $map: {
                      input: {
                        $filter: {
                          input: "$subCategories",
                          as: "sc2",
                          cond: {
                            $eq: ["$$sc2.parent", "$$sc1._id"],
                          },
                        },
                      },
                      as: "sc3",
                      in: {
                        $mergeObjects: [
                          "$$sc3",
                          {
                            subCategories: {
                              $map: {
                                input: {
                                  $filter: {
                                    input: "$subCategories",
                                    as: "sc4",
                                    cond: {
                                      $eq: ["$$sc4.parent", "$$sc3._id"],
                                    },
                                  },
                                },
                                as: "sc5",
                                in: {
                                  $mergeObjects: [
                                    "$$sc5",
                                    {
                                      subCategories: {
                                        $filter: {
                                          input: "$subCategories",
                                          as: "sc6",
                                          cond: {
                                            $eq: ["$$sc6.parent", "$$sc5._id"],
                                          },
                                        },
                                      },
                                    },
                                  ],
                                },
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
    },
    {
      $sort: {
        name: 1,
      },
    },
  ];

  let err, category;
  [err, category] = await to(
    Category.aggregatePaginate(Category.aggregate(query), options)
  );
  if (err) {
    return ReE(res, err, HttpStatus.BAD_REQUEST);
  }
  return ReS(
    res,
    {
      category: category,
    },
    HttpStatus.OK
  );
};

module.exports.getAllListCategories = getAllListCategories;

const getCategoriesByAdmin = async function (req, res) {
  let page = req.body.page || 1;
  let limit = req.body.limit || 50;
  let admin = req.user;

  if (admin?.role !== "admin")
    return ReE(
      res,
      { message: "Invalid access", success: false },
      HttpStatus.UNAUTHORIZED
    );

  let options = {
    page: page,
    limit: limit,
    lean: true,
  };
  query = [
    {
      $match: {
        parent: null,
        active: true,
      },
    },
    {
      $graphLookup: {
        from: "categories",
        startWith: "$_id",
        connectFromField: "_id",
        connectToField: "parent",
        as: "subCategories",
        maxDepth: 100,
        depthField: "level",
        restrictSearchWithMatch: { active: true },
      },
    },
    {
      $addFields: {
        subCategories: {
          $map: {
            input: "$subCategories",
            as: "sc1",
            in: {
              $mergeObjects: [
                "$$sc1",
                {
                  subCategories: {
                    $map: {
                      input: {
                        $filter: {
                          input: "$subCategories",
                          as: "sc2",
                          cond: {
                            $eq: ["$$sc2.parent", "$$sc1._id"],
                          },
                        },
                      },
                      as: "sc3",
                      in: {
                        $mergeObjects: [
                          "$$sc3",
                          {
                            subCategories: {
                              $map: {
                                input: {
                                  $filter: {
                                    input: "$subCategories",
                                    as: "sc4",
                                    cond: {
                                      $eq: ["$$sc4.parent", "$$sc3._id"],
                                    },
                                  },
                                },
                                as: "sc5",
                                in: {
                                  $mergeObjects: [
                                    "$$sc5",
                                    {
                                      subCategories: {
                                        $filter: {
                                          input: "$subCategories",
                                          as: "sc6",
                                          cond: {
                                            $eq: ["$$sc6.parent", "$$sc5._id"],
                                          },
                                        },
                                      },
                                    },
                                  ],
                                },
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
    },
    {
      $sort: {
        name: 1,
      },
    },
  ];

  let err, category;
  [err, category] = await to(
    Category.aggregatePaginate(Category.aggregate(query), options)
  );
  if (err) {
    return ReE(res, err, HttpStatus.BAD_REQUEST);
  }
  return ReS(
    res,
    {
      category: category,
    },
    HttpStatus.OK
  );
};

module.exports.getCategoriesByAdmin = getCategoriesByAdmin;

const getCategoryById = async function (req, res) {
  let id = req?.params?.id;

  var query = [
    {
      $match: {
        active: true,
        _id: ObjectId(req?.params?.id),
      },
    },
    {
      $graphLookup: {
        from: "categories",
        startWith: "$_id",
        connectFromField: "parent",
        connectToField: "_id",
        as: "children",
        restrictSearchWithMatch: { active: true },
      },
    },
    {
      $unwind: {
        path: "$children",
        includeArrayIndex: "index",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];
  let err, category;

  [err, category] = await to(Category.aggregate(query));
  console.log(category, "cadgs");
  if (err) {
    return ReE(res, err, HttpStatus.BAD_REQUEST);
  }
  return ReS(
    res,
    {
      category: category[0],
    },
    HttpStatus.OK
  );
};
module.exports.getCategoryById = getCategoryById;

const updateCategory = async function (req, res) {
  let err, category, data;
  data = req.body.product;

  let productId = req.params.id;
  let body = req.body;

  if (!ObjectId.isValid(productId)) {
    return ReE(
      res,
      { message: "please provide valid category Id" },
      HttpStatus.BAD_REQUEST
    );
  }

  let query = {
    _id: productId,
  };

  [err, category] = await to(Category.findByIdAndUpdate(query, body), {
    upsert: true,
  });
  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  return ReS(res, { category: category }, HttpStatus.OK);
};
module.exports.updateCategory = updateCategory;

const deleteCategory = async (req, res) => {
  if (
    req.params.id === undefined ||
    req.params.id === "" ||
    !ObjectId.isValid(req.params.id)
  ) {
    return ReE(
      res,
      {
        message: "Valid Contest id required!",
      },
      422
    );
  }
  let err, category;

  [err, category] = await to(
    Category.findOne({
      active: true,
      _id: ObjectId(req.params.id),
    })
  );

  if (err) return ReE(res, { message: err.message }, 500);

  if (!category) return ReE(res, { message: "category not found!" }, 404);

  category.active = false;

  [err, category] = await to(category.save());

  if (err) return ReE(res, { message: err.message }, 500);

  return ReS(
    res,
    {
      message: "Category deleted successfully!",
    },
    200
  );
};
module.exports.deleteCategory = deleteCategory;
