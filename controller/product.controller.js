const { ReS, ReE, to, isNull } = require("../services/util.services");
const { Product } = require("../models");
const HttpStatus = require("http-status");
const { ObjectId } = require("mongoose").Types;

const createProduct = async function (req, res) {
  const body = req.body;

  body.userId = req.user._id;

  let user = req.user;

  if (user.role !== "admin" && !user?.permissions?.incldes("create-product"))
    return ReE(
      res,
      { message: "Invalid access", success: false },
      HttpStatus.UNAUTHORIZED
    );
  else if (isNull(body.name)) {
    return ReE(
      res,
      { message: "Product name is required", success: false },
      400
    );
  } else if (isNull(body.images)) {
    return ReE(
      res,
      { message: "Product image is required", success: false },
      400
    );
  } else if (body.images?.length < 3) {
    return ReE(
      res,
      { message: "Atleast 3 product images is required", success: false },
      400
    );
  } else if (isNull(body.category)) {
    return ReE(
      res,
      { message: "Product category is required", success: false },
      400
    );
  } else if (isNull(body.price)) {
    return ReE(
      res,
      { message: "Product price is required", success: false },
      400
    );
  } else if (isNull(body.discount_percentage)) {
    return ReE(
      res,
      { message: "Product discount percentage is required", success: false },
      400
    );
  } else if (isNull(body.tax_percentage)) {
    return ReE(
      res,
      { message: "Product tax percentage is required", success: false },
      400
    );
  } else if (isNull(body.tax_amount)) {
    return ReE(
      res,
      { message: "Product tax amount is required", success: false },
      400
    );
  } else if (isNull(body.discount_amount)) {
    return ReE(
      res,
      { message: "Product discount amount is required", success: false },
      400
    );
  } else if (body.category?.length < 1) {
    return ReE(
      res,
      { message: "Atleast onw product category is required", success: false },
      400
    );
  } else if (isNull(body?.userId))
    return ReE(
      res,
      { message: "Please provide a valid userId", success: false },
      HttpStatus.BAD_REQUEST
    );
  else if (isNull(body?.unit))
    return ReE(
      res,
      { message: "Please provide a valid unit", success: false },
      HttpStatus.BAD_REQUEST
    );
  else if (isNull(body?.stock))
    return ReE(
      res,
      { message: "Please provide a valid unit", success: false },
      HttpStatus.BAD_REQUEST
    );
  else if (!CONFIG.units.includes(body?.unit))
    return ReE(
      res,
      { message: "Please provide a valid unit", success: false },
      HttpStatus.BAD_REQUEST
    );
  else {
    let err, product;

    [err, product] = await to(Product.create(body));

    if (err) {
      return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    } else {
      if (product) {
        return ReS(
          res,
          { message: "Product Added.", product: product },
          HttpStatus.OK
        );
      }
    }
  }
};

module.exports.createProduct = createProduct;

const getAllProducts = async function (req, res) {
  let page = req.query.page || 1;
  let limit = req.query.limit || 10;

  let options = {
    page: page,
    limit: limit,
    lean: true,
    sort: {
      timestamp: "desc",
    },
    populate: ["category", "userId"],
  };

  var query = {
    active: true,
  };
  let err, product;

  [err, product] = await to(Product.paginate(query, options));
  if (err) {
    return ReE(res, err, HttpStatus.BAD_REQUEST);
  }
  return ReS(
    res,
    {
      product: product,
    },
    HttpStatus.OK
  );
};
module.exports.getAllProducts = getAllProducts;

const getProductById = async function (req, res) {
  let id = req.params.id;

  var query = [
    {
      $match: {
        _id: new ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categories",
      },
    },
    {
      $addFields: {
        categoryExists: {
          $gt: [
            {
              $size: "$categories",
            },
            0,
          ],
        },
      },
    },
    {
      $facet: {
        hasCategory: [
          {
            $match: {
              categoryExists: true,
            },
          },
          {
            $graphLookup: {
              from: "categories",
              startWith: "$$ROOT.categories.parent",
              connectFromField: "parent",
              connectToField: "_id",
              maxDepth: 2,
              as: "category",
              restrictSearchWithMatch: {
                active: true,
              },
            },
          },
        ],
        noCategory: [
          {
            $match: {
              categoryExists: false,
            },
          },
          {
            $group: {
              _id: "$projectId",
              productId: {
                $first: "$_id",
              },
              projectId: {
                $first: "$projectId",
              },
              name: {
                $first: "$name",
              },
              description: {
                $first: "$description",
              },
              images: {
                $first: "$images",
              },
              price: {
                $first: "$price",
              },
              currency: {
                $first: "$currency",
              },
              attributes: {
                $first: "$attributes",
              },
              type: {
                $first: "$type",
              },
              unit: {
                $first: "$unit",
              },
              priceType: {
                $first: "$priceType",
              },
              userId: {
                $first: "$userId",
              },
              active: {
                $first: "$active",
              },
              mrpPrice: {
                $first: "$mrpPrice",
              },
              stock: {
                $first: "$stock",
              },
              unlimitedQty: {
                $first: "$unlimitedQty",
              },
              isPhysical: {
                $first: "$isPhysical",
              },
              totalQty: {
                $first: "$totalQty",
              },
              availableQty: {
                $first: "$availableQty",
              },
              outOfStockNotification: {
                $first: "$outOfStockNotification",
              },
              minPurchaseQty: {
                $first: "$minPurchaseQty",
              },
              maxPurchaseQty: {
                $first: "$maxPurchaseQty",
              },
              outOfStockQtyNotification: {
                $first: "$outOfStockQtyNotification",
              },
              MRPprice: {
                $first: "$MRPprice",
              },
              enable: {
                $first: "$enable",
              },
              courseDetails: {
                $first: "$courseDetails",
              },
              locationDetails: {
                $first: "$locationDetails",
              },
              propertyDetails: {
                $first: "$propertyDetails",
              },
              tenancyDetails: {
                $first: "$tenancyDetails",
              },
              financialDetails: {
                $first: "$financialDetails",
              },
              subDescription: {
                $first: "$subDescription",
              },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "userId",
            },
          },
          {
            $unwind: {
              path: "$userId",
              preserveNullAndEmptyArrays: true,
            },
          },
        ],
      },
    },
    {
      $project: {
        result: {
          $cond: {
            if: {
              $gt: [
                {
                  $size: "$hasCategory",
                },
                0,
              ],
            },
            then: {
              $arrayElemAt: ["$hasCategory", 0],
            },
            else: {
              $arrayElemAt: ["$noCategory", 0],
            },
          },
        },
      },
    },
  ];
  let err, product;

  [err, product] = await to(Product.aggregate(query));
  if (err) {
    return ReE(res, err, HttpStatus.BAD_REQUEST);
  }
  return ReS(
    res,
    {
      product: product[0],
    },
    HttpStatus.OK
  );
};
module.exports.getProductById = getProductById;

const getProductByFilter = async (req, res) => {
  let query, options;
  let page = req.body.page || 1;
  let limit = req.body.limit || 10;
  let search = {};
  let searchFields = req.body?.search;
  let body = req.body;
  let filter = req.body.filter;

  options = {
    page: page,
    limit: limit,
    lean: true,
    sort: body.sort,
    populate: "category",
  };

  for (const property in searchFields) {
    let field = property;
    search = {
      ...{
        [field]: { $regex: searchFields[property], $options: "i" },
      },
    };
  }

  query = {
    active: true,
    ...filter,
    ...search,
  };
  let product, err;

  // [err, product] = await to(Product.aggregate(query, options));
  [err, product] = await to(Product.paginate(query, options));
  console.log(product, "priii");
  if (err) {
    return ReE(res, err, HttpStatus.BAD_REQUEST);
  }
  return ReS(
    res,
    { message: "Filtered product", product: product, success: true },
    HttpStatus.OK
  );
};

module.exports.getProductByFilter = getProductByFilter;

const getProductsByAdmin = async (req, res) => {
  let query, options;
  let page = req.body.page || 1;
  let limit = req.body.limit || 10;
  let search = {};
  let searchFields = req.body?.search;
  let body = req.body;
  let filter = req.body.filter;
  let user = req.user;

  if (user?.role !== "admin")
    return ReE(
      res,
      { message: "Invalid access", success: false },
      HttpStatus.UNAUTHORIZED
    );

  options = {
    page: page,
    limit: limit,
    lean: true,
    sort: body.sort,
    populate: "category",
  };

  for (const property in searchFields) {
    let field = property;
    search = {
      ...{
        [field]: { $regex: searchFields[property], $options: "i" },
      },
    };
  }

  query = {
    active: true,
    ...filter,
    ...search,
  };

  let product, err;
  [err, product] = await to(Product.paginate(query, options));

  if (err) {
    return ReE(res, err, HttpStatus.BAD_REQUEST);
  }
  return ReS(
    res,
    { message: "Filtered product", product: product, success: true },
    HttpStatus.OK
  );
};

module.exports.getProductsByAdmin = getProductsByAdmin;

const updateProduct = async function (req, res) {
  let err, product, data;
  data = req.body;

  let productId = req.params.id;

  let user = req.user;

  if (user.role !== "admin" && !user?.permissions?.incldes("edit-product"))
    return ReE(
      res,
      { message: "Invalid access", success: false },
      HttpStatus.UNAUTHORIZED
    );

  if (!ObjectId.isValid(productId)) {
    return ReE(
      res,
      { message: "please provide valid product Id" },
      HttpStatus.BAD_REQUEST
    );
  }

  let query = {
    _id: productId,
  };

  [err, product] = await to(Product.findByIdAndUpdate(query, data));

  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  return ReS(res, { product: product }, HttpStatus.OK);
};
module.exports.updateProduct = updateProduct;

const Deleteproduct = async (req, res) => {
  let user = req.user;

  if (user.role !== "admin" && !user?.permissions?.incldes("delete-product"))
    return ReE(
      res,
      { message: "Invalid access", success: false },
      HttpStatus.UNAUTHORIZED
    );

  if (
    req.params.id === undefined ||
    req.params.id === "" ||
    !ObjectId.isValid(req.params.id)
  ) {
    return ReE(
      res,
      {
        message: "Valid product id required!",
      },
      422
    );
  }

  let err, product;

  [err, product] = await to(
    Product.findOne({
      active: true,
      _id: ObjectId(req.params.id),
    })
  );

  if (err)
    return ReE(
      res,
      {
        message: err.message,
      },
      500
    );

  if (!product)
    return ReE(
      res,
      {
        message: "products not found!",
      },
      404
    );

  product.active = false;

  [err, product] = await to(product.save());

  if (err)
    return ReE(
      res,
      {
        message: err.message,
      },
      500
    );

  return ReS(
    res,
    {
      message: "Products deleted successfully!",
    },
    200
  );
};

module.exports.Deleteproduct = Deleteproduct;
