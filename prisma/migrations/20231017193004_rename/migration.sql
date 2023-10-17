/*
  Warnings:

  - Added the required column `path` to the `image` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `image` RENAME COLUMN `url` TO `path` ;
ALTER TABLE `image` ADD COLUMN `url` VARCHAR(191) NOT NULL;
