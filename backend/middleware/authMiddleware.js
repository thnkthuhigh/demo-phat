import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Kiểm tra token trong header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Tách token từ Bearer
      token = req.headers.authorization.split(" ")[1];

      // Debug info
      console.log("Authorization header found");
      console.log(`Token length: ${token?.length || 0}`);

      if (!token) {
        console.log("No token provided after Bearer");
        res.status(401);
        throw new Error("Not authorized, no token");
      }

      // Kiểm tra JWT_SECRET
      console.log(
        `Using JWT_SECRET [length: ${process.env.JWT_SECRET?.length || 0}]`
      );
      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is missing");
        res.status(500);
        throw new Error("Server configuration error");
      }

      // Xác thực token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token verified successfully:", decoded.id);

      // Tìm user theo ID trong token
      console.log("Finding user with ID:", decoded.id);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        console.log("User not found for ID:", decoded.id);
        res.status(401);
        throw new Error("User not found");
      }

      console.log("User found:", user.email || user.name);
      req.user = user;
      next();
    } catch (error) {
      console.error("Authentication error:", error.message);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    console.log("No Authorization header found");
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as an admin");
  }
};

export { protect, admin };
