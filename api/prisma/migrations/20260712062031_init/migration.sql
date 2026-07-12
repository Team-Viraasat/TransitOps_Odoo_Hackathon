-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('Fleet_Manager', 'Dispatcher', 'Safety_Officer', 'Financial_Analyst', 'Admin');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('Active', 'Locked', 'Disabled');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('Van', 'Truck', 'Mini', 'Container', 'Other');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('Available', 'On_Trip', 'In_Shop', 'Retired');

-- CreateEnum
CREATE TYPE "LicenseCategory" AS ENUM ('LMV', 'HMV', 'Transport', 'Other');

-- CreateEnum
CREATE TYPE "DriverStatus" AS ENUM ('Available', 'On_Trip', 'Off_Duty', 'Suspended');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('Draft', 'Dispatched', 'Completed', 'Cancelled');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('Active', 'Completed');

-- CreateEnum
CREATE TYPE "ExpenseType" AS ENUM ('Toll', 'Maintenance', 'Misc');

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "name" "RoleName" NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role_id" UUID NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'Active',
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" UUID NOT NULL,
    "registration_number" TEXT NOT NULL,
    "name_model" TEXT NOT NULL,
    "type" "VehicleType" NOT NULL,
    "max_load_kg" DECIMAL(10,2) NOT NULL,
    "odometer_km" INTEGER NOT NULL,
    "acquisition_cost" DECIMAL(12,2) NOT NULL,
    "region" TEXT NOT NULL,
    "status" "VehicleStatus" NOT NULL DEFAULT 'Available',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "license_number" TEXT NOT NULL,
    "license_category" "LicenseCategory" NOT NULL,
    "license_expiry_date" TIMESTAMP(3) NOT NULL,
    "contact_number" TEXT NOT NULL,
    "safety_score" INTEGER NOT NULL DEFAULT 100,
    "status" "DriverStatus" NOT NULL DEFAULT 'Available',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" UUID NOT NULL,
    "trip_code" TEXT NOT NULL,
    "vehicle_id" UUID,
    "driver_id" UUID,
    "source" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "cargo_weight_kg" DECIMAL(10,2) NOT NULL,
    "planned_distance_km" DECIMAL(10,2) NOT NULL,
    "actual_distance_km" DECIMAL(10,2),
    "start_odometer_km" INTEGER,
    "final_odometer_km" INTEGER,
    "fuel_consumed_liters" DECIMAL(10,2),
    "revenue" DECIMAL(12,2),
    "status" "TripStatus" NOT NULL DEFAULT 'Draft',
    "cancel_reason" TEXT,
    "dispatched_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_logs" (
    "id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "service_type" TEXT NOT NULL,
    "description" TEXT,
    "cost" DECIMAL(12,2) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'Active',
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuel_logs" (
    "id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "trip_id" UUID,
    "liters" DECIMAL(10,2) NOT NULL,
    "cost" DECIMAL(12,2) NOT NULL,
    "log_date" TIMESTAMP(3) NOT NULL,
    "odometer_km" INTEGER,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fuel_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" UUID NOT NULL,
    "trip_id" UUID,
    "vehicle_id" UUID,
    "type" "ExpenseType" NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "expense_date" TIMESTAMP(3) NOT NULL,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "before_json" JSONB,
    "after_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_registration_number_key" ON "vehicles"("registration_number");

-- CreateIndex
CREATE INDEX "vehicles_status_idx" ON "vehicles"("status");

-- CreateIndex
CREATE INDEX "vehicles_type_idx" ON "vehicles"("type");

-- CreateIndex
CREATE INDEX "vehicles_region_idx" ON "vehicles"("region");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_license_number_key" ON "drivers"("license_number");

-- CreateIndex
CREATE INDEX "drivers_status_idx" ON "drivers"("status");

-- CreateIndex
CREATE INDEX "drivers_license_expiry_date_idx" ON "drivers"("license_expiry_date");

-- CreateIndex
CREATE UNIQUE INDEX "trips_trip_code_key" ON "trips"("trip_code");

-- CreateIndex
CREATE INDEX "trips_status_idx" ON "trips"("status");

-- CreateIndex
CREATE INDEX "trips_vehicle_id_idx" ON "trips"("vehicle_id");

-- CreateIndex
CREATE INDEX "trips_driver_id_idx" ON "trips"("driver_id");

-- CreateIndex
CREATE INDEX "maintenance_logs_vehicle_id_idx" ON "maintenance_logs"("vehicle_id");

-- CreateIndex
CREATE INDEX "maintenance_logs_status_idx" ON "maintenance_logs"("status");

-- CreateIndex
CREATE INDEX "fuel_logs_vehicle_id_idx" ON "fuel_logs"("vehicle_id");

-- CreateIndex
CREATE INDEX "expenses_vehicle_id_idx" ON "expenses"("vehicle_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_logs" ADD CONSTRAINT "maintenance_logs_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_logs" ADD CONSTRAINT "maintenance_logs_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
