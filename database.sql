
CREATE DATABASE IF NOT EXISTS `abc_mall`;
USE `abc_mall`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `role` ENUM('customer', 'shop_owner', 'admin') DEFAULT 'customer',
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,

);

CREATE TABLE IF NOT EXISTS `shops` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `status` ENUM('open', 'closed') DEFAULT 'open',
  `rent_status` ENUM('Paid', 'Pending') DEFAULT 'Pending',
  `rent_amount` FLOAT NOT NULL DEFAULT 1000,
  `rating` FLOAT DEFAULT 0,
  `owner_id` INT,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `price` FLOAT NOT NULL,
  `quantity` INT NOT NULL DEFAULT 0,
  `image_url` VARCHAR(255) DEFAULT '',
  `average_rating` FLOAT DEFAULT 0,
  `shop_id` INT,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`shop_id`) REFERENCES `shops`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `sales` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `quantity_sold` INT NOT NULL,
  `date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `product_id` INT,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `ratings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `score` INT NOT NULL CHECK (`score` >= 1 AND `score` <= 5),
  `product_id` INT,
  `user_id` INT,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
