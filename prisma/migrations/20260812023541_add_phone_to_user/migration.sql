/*
  Warnings:

  - You are about to drop the column `address` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "address",
ADD COLUMN     "desaKelurahan" TEXT,
ADD COLUMN     "detailAlamat" TEXT,
ADD COLUMN     "kabupatenKota" TEXT,
ADD COLUMN     "kecamatan" TEXT,
ADD COLUMN     "namaTempat" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "provinsi" TEXT;
