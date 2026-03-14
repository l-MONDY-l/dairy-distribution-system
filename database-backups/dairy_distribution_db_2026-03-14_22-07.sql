--
-- PostgreSQL database dump
--

\restrict OIfLclpWfQboQLcfsA2ps5bgU6DIb47CYpWmDbphHQ812w1MosV2ArR2SKRIVSY

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: ApprovalStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ApprovalStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


--
-- Name: BusinessType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BusinessType" AS ENUM (
    'SOLE_PROPRIETORSHIP',
    'PARTNERSHIP',
    'PRIVATE_LIMITED',
    'PUBLIC_LIMITED',
    'OTHER'
);


--
-- Name: DeliveryStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DeliveryStatus" AS ENUM (
    'PENDING',
    'IN_TRANSIT',
    'DELIVERED',
    'FAILED'
);


--
-- Name: DiscountType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DiscountType" AS ENUM (
    'PERCENTAGE',
    'FIXED'
);


--
-- Name: DispatchStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DispatchStatus" AS ENUM (
    'PENDING',
    'ASSIGNED',
    'DISPATCHED',
    'DELIVERED',
    'FAILED'
);


--
-- Name: IndustryType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."IndustryType" AS ENUM (
    'DAIRY_MANUFACTURING',
    'DAIRY_DISTRIBUTION',
    'DAIRY_MANUFACTURING_DISTRIBUTION',
    'FOOD_PROCESSING',
    'OTHER'
);


--
-- Name: NotificationChannel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NotificationChannel" AS ENUM (
    'EMAIL',
    'SMS',
    'SYSTEM'
);


--
-- Name: NotificationSendStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NotificationSendStatus" AS ENUM (
    'PENDING',
    'SENT',
    'FAILED'
);


--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'DRAFT',
    'PENDING_APPROVAL',
    'APPROVED',
    'ASSIGNED',
    'DISPATCHED',
    'DELIVERED',
    'CANCELLED',
    'REJECTED'
);


--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PARTIAL',
    'PAID',
    'FAILED'
);


--
-- Name: PaymentType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentType" AS ENUM (
    'CASH',
    'BANK_TRANSFER',
    'ONLINE'
);


--
-- Name: ReturnStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ReturnStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'HOLD'
);


--
-- Name: ShopStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ShopStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'DISABLED'
);


--
-- Name: TripStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TripStatus" AS ENUM (
    'PENDING',
    'STARTED',
    'COMPLETED',
    'CANCELLED'
);


--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_logs (
    id text NOT NULL,
    "userId" text NOT NULL,
    module text NOT NULL,
    action text NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text NOT NULL,
    "oldValues" jsonb,
    "newValues" jsonb,
    "ipAddress" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: agent_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agent_profiles (
    id text NOT NULL,
    "userId" text NOT NULL,
    "regionId" text NOT NULL,
    "monthlyTarget" numeric(12,2) DEFAULT 0 NOT NULL,
    "notificationSms" boolean DEFAULT true NOT NULL,
    "notificationEmail" boolean DEFAULT true NOT NULL,
    status boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: cities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cities (
    id text NOT NULL,
    "regionId" text NOT NULL,
    name text NOT NULL,
    status boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "districtId" text
);


--
-- Name: city_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.city_assignments (
    id text NOT NULL,
    "cityId" text NOT NULL,
    "agentId" text NOT NULL,
    "driverId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: company_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_profiles (
    id text NOT NULL,
    "companyCode" text NOT NULL,
    "legalName" text NOT NULL,
    "brandName" text NOT NULL,
    "registrationNumber" text NOT NULL,
    "taxId" text,
    "vatNumber" text,
    "businessType" public."BusinessType" NOT NULL,
    "industryType" public."IndustryType" DEFAULT 'DAIRY_MANUFACTURING_DISTRIBUTION'::public."IndustryType" NOT NULL,
    "companyEmail" text NOT NULL,
    "companyPhone" text NOT NULL,
    "companyMobile" text,
    "whatsappNumber" text,
    website text,
    "logoUrl" text,
    "profileImageUrl" text,
    description text,
    "establishedDate" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "factoryName" text,
    "factoryLicenseNumber" text,
    "foodSafetyLicenseNumber" text,
    "dairyBoardRegistrationNumber" text,
    "processingCapacityLitersPerDay" integer DEFAULT 0 NOT NULL,
    "coldStorageCapacityLiters" integer DEFAULT 0 NOT NULL,
    "factoryPhone" text,
    "factoryEmail" text,
    "addressLine1" text NOT NULL,
    "addressLine2" text,
    street text,
    city text NOT NULL,
    district text NOT NULL,
    province text NOT NULL,
    "postalCode" text NOT NULL,
    country text NOT NULL,
    latitude double precision,
    longitude double precision,
    "ownerName" text,
    "managingDirectorName" text,
    "operationsManagerName" text,
    "financeManagerName" text,
    "factoryManagerName" text,
    "primaryContactPerson" text NOT NULL,
    "primaryContactEmail" text,
    "primaryContactPhone" text NOT NULL,
    "emergencyContactName" text,
    "emergencyContactPhone" text,
    "businessOpenTime" text,
    "businessCloseTime" text,
    "factoryOpenTime" text,
    "factoryCloseTime" text,
    "deliveryStartTime" text,
    "deliveryEndTime" text,
    "workingDays" text[],
    "distributionRegions" text[],
    "fleetSize" integer DEFAULT 0 NOT NULL,
    "numberOfDrivers" integer DEFAULT 0 NOT NULL,
    "numberOfAgents" integer DEFAULT 0 NOT NULL,
    "dailyDeliveryCapacity" integer DEFAULT 0 NOT NULL,
    "supportsIslandwideDelivery" boolean DEFAULT false NOT NULL,
    "hasSLS" boolean DEFAULT false NOT NULL,
    "hasISO22000" boolean DEFAULT false NOT NULL,
    "hasHACCP" boolean DEFAULT false NOT NULL,
    "hasISO9001" boolean DEFAULT false NOT NULL,
    "certificationNotes" text,
    "bankName" text,
    "bankBranch" text,
    "accountName" text,
    "accountNumber" text,
    "swiftCode" text,
    "paymentSupportEmail" text,
    "billingEmail" text,
    "defaultCurrency" text DEFAULT 'LKR'::text NOT NULL,
    timezone text DEFAULT 'Asia/Colombo'::text NOT NULL,
    language text DEFAULT 'en'::text NOT NULL,
    "invoicePrefix" text DEFAULT 'INV-'::text NOT NULL,
    "orderPrefix" text DEFAULT 'ORD-'::text NOT NULL,
    "clientPrefix" text DEFAULT 'CLT-'::text NOT NULL,
    "agentPrefix" text DEFAULT 'AGT-'::text NOT NULL,
    "driverPrefix" text DEFAULT 'DRV-'::text NOT NULL,
    "stockPrefix" text DEFAULT 'STK-'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: company_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_settings (
    id text NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    "contactPersonName" text,
    "contactEmail" text,
    country text,
    street text,
    "addressNo" text,
    "postalCode" text,
    website text,
    "taxId" text,
    "openingTime" text,
    "closingTime" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: discounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.discounts (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "shopId" text NOT NULL,
    "agentId" text NOT NULL,
    "discountType" public."DiscountType" NOT NULL,
    "discountValue" numeric(12,2) NOT NULL,
    "approvalStatus" public."ApprovalStatus" DEFAULT 'PENDING'::public."ApprovalStatus" NOT NULL,
    "approvedById" text,
    "approvedAt" timestamp(3) without time zone,
    reason text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: dispatches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dispatches (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "driverId" text NOT NULL,
    "dispatchDate" timestamp(3) without time zone,
    "deliveredDate" timestamp(3) without time zone,
    "deliveryStatus" public."DeliveryStatus" DEFAULT 'PENDING'::public."DeliveryStatus" NOT NULL,
    remarks text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: districts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.districts (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    status boolean DEFAULT true NOT NULL,
    "regionId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: driver_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.driver_profiles (
    id text NOT NULL,
    "userId" text NOT NULL,
    "regionId" text NOT NULL,
    "vehicleNumber" text,
    "licenseNumber" text,
    "fuelQuotaDaily" numeric(10,2) DEFAULT 0 NOT NULL,
    "notificationSms" boolean DEFAULT true NOT NULL,
    "notificationEmail" boolean DEFAULT true NOT NULL,
    status boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: fuel_allocations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fuel_allocations (
    id text NOT NULL,
    "driverId" text NOT NULL,
    "tripDate" timestamp(3) without time zone NOT NULL,
    "allocatedLiters" numeric(10,2) NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id text NOT NULL,
    "invoiceNo" text NOT NULL,
    "orderId" text NOT NULL,
    "shopId" text NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    "discountTotal" numeric(12,2) DEFAULT 0 NOT NULL,
    "taxTotal" numeric(12,2) DEFAULT 0 NOT NULL,
    total numeric(12,2) NOT NULL,
    "paymentStatus" public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "issuedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dueDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: notification_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_templates (
    id text NOT NULL,
    name text NOT NULL,
    channel public."NotificationChannel" NOT NULL,
    "triggerEvent" text NOT NULL,
    subject text,
    body text NOT NULL,
    status boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    "userId" text,
    "shopId" text,
    channel public."NotificationChannel" NOT NULL,
    "triggerEvent" text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    "sentStatus" public."NotificationSendStatus" DEFAULT 'PENDING'::public."NotificationSendStatus" NOT NULL,
    "sentAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text NOT NULL,
    qty integer NOT NULL,
    "unitPrice" numeric(12,2) NOT NULL,
    "discountType" public."DiscountType",
    "discountValue" numeric(12,2),
    "lineTotal" numeric(12,2) NOT NULL
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id text NOT NULL,
    "orderNo" text NOT NULL,
    "shopId" text NOT NULL,
    "placedByUserId" text NOT NULL,
    "agentId" text,
    "driverId" text,
    "regionId" text NOT NULL,
    "cityId" text NOT NULL,
    "paymentType" public."PaymentType" NOT NULL,
    "paymentStatus" public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "approvalStatus" public."ApprovalStatus" DEFAULT 'PENDING'::public."ApprovalStatus" NOT NULL,
    "dispatchStatus" public."DispatchStatus" DEFAULT 'PENDING'::public."DispatchStatus" NOT NULL,
    "orderStatus" public."OrderStatus" DEFAULT 'PENDING_APPROVAL'::public."OrderStatus" NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    "discountTotal" numeric(12,2) DEFAULT 0 NOT NULL,
    "taxTotal" numeric(12,2) DEFAULT 0 NOT NULL,
    "grandTotal" numeric(12,2) NOT NULL,
    notes text,
    "orderedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deliveryDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id text NOT NULL,
    "invoiceId" text NOT NULL,
    "shopId" text NOT NULL,
    "paymentMethod" public."PaymentType" NOT NULL,
    amount numeric(12,2) NOT NULL,
    "referenceNo" text,
    "paidAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    module text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id text NOT NULL,
    name text NOT NULL,
    sku text NOT NULL,
    "unitType" text NOT NULL,
    "unitVolume" text,
    price numeric(12,2) NOT NULL,
    status boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: regions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.regions (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    status boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: return_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.return_items (
    id text NOT NULL,
    "returnId" text NOT NULL,
    "productId" text NOT NULL,
    "goodQty" integer DEFAULT 0 NOT NULL,
    "brokenQty" integer DEFAULT 0 NOT NULL,
    "missingQty" integer DEFAULT 0 NOT NULL
);


--
-- Name: returns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.returns (
    id text NOT NULL,
    "returnNo" text NOT NULL,
    "shopId" text NOT NULL,
    "agentId" text,
    "driverId" text,
    status public."ReturnStatus" DEFAULT 'PENDING'::public."ReturnStatus" NOT NULL,
    "requestedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "approvedAt" timestamp(3) without time zone,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_permissions (
    id text NOT NULL,
    "roleId" text NOT NULL,
    "permissionId" text NOT NULL
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id text NOT NULL,
    "companyName" text NOT NULL,
    "companyLogo" text,
    slogan text,
    address text,
    "contactNumber" text,
    "brNumber" text,
    email text,
    website text,
    currency text DEFAULT 'LKR'::text NOT NULL,
    language text DEFAULT 'en'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: shops; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shops (
    id text NOT NULL,
    code text NOT NULL,
    "shopName" text NOT NULL,
    "ownerName" text,
    phone text,
    email text,
    address text,
    website text,
    "logoUrl" text,
    "regionId" text NOT NULL,
    "cityId" text NOT NULL,
    "assignedAgentId" text,
    "assignedDriverId" text,
    status public."ShopStatus" DEFAULT 'PENDING'::public."ShopStatus" NOT NULL,
    "notifySms" boolean DEFAULT true NOT NULL,
    "notifyEmail" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: stock_allocations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_allocations (
    id text NOT NULL,
    "agentId" text NOT NULL,
    "productId" text NOT NULL,
    "allocatedQty" integer NOT NULL,
    "usedQty" integer DEFAULT 0 NOT NULL,
    "remainingQty" integer NOT NULL,
    "allocationDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: town_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.town_assignments (
    id text NOT NULL,
    "townId" text NOT NULL,
    "agentId" text NOT NULL,
    "driverId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: towns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.towns (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    status boolean DEFAULT true NOT NULL,
    "cityId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: trip_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trip_logs (
    id text NOT NULL,
    "driverId" text NOT NULL,
    "tripDate" timestamp(3) without time zone NOT NULL,
    "startTime" timestamp(3) without time zone,
    "endTime" timestamp(3) without time zone,
    "startMeter" numeric(10,2),
    "endMeter" numeric(10,2),
    "totalKm" numeric(10,2),
    "stopsCount" integer DEFAULT 0 NOT NULL,
    "routeNotes" text,
    status public."TripStatus" DEFAULT 'PENDING'::public."TripStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    "fullName" text NOT NULL,
    email text NOT NULL,
    phone text,
    "passwordHash" text NOT NULL,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL,
    "roleId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    username text
);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
c7112f20-38f5-411e-8896-e3eb2f05bbe2	611f59a9e132a0028e6b1e004b387881122d1c0261116087c8181efa7ac8e4ed	2026-03-12 22:23:31.666685+05:30	20260312165331_init	\N	\N	2026-03-12 22:23:31.500612+05:30	1
6075aa54-dd0f-4aa9-aa72-defba4fba67f	c7bad75b6bf2f1734ff63eef8591748f68482f3ce8da9e3b4d2858f16dc135fd	2026-03-13 04:29:50.142228+05:30	20260312225950_add_username	\N	\N	2026-03-13 04:29:50.094381+05:30	1
f423c535-cc72-4911-91d0-0de53b2b93dc	5c86c03c2f6930ca24796de177eec2be70e40ddfd95ab19ff1e78f0240ebbf74	2026-03-13 16:37:25.648021+05:30	20260313110725_add_company_setting	\N	\N	2026-03-13 16:37:25.586509+05:30	1
a650c8c3-ba2f-45b6-93a2-8dfd88694db5	dce8bd4c03fa126a765e99a9b3859c2ed2afff301c2e77589c272cf6ed82baba	2026-03-13 18:59:38.549451+05:30	20260313132938_add_company_profile	\N	\N	2026-03-13 18:59:38.452167+05:30	1
492bca36-19a0-4ab9-a545-79db47419065	f320518faeedea0faed76b581e1cc4a84f73fd0e942d57520bf6a11d86dcfede	2026-03-14 02:01:21.152714+05:30	20260313203121_add_city_assignment	\N	\N	2026-03-14 02:01:21.031877+05:30	1
faac5081-9eac-4e81-b668-b55dddcb13bd	bc24a23cbff61e98595cef6bd5e172dfd366f04f5495bf4c65b5b852770418a1	2026-03-14 03:27:26.946233+05:30	20260313215726_add_districts_table	\N	\N	2026-03-14 03:27:26.847004+05:30	1
f91adefa-12d0-4e86-b615-cc0ee2bc5955	027353126b1addd645b5ea34578d91b38e341b0ff33c2beb7c7213182ddc1582	2026-03-14 03:57:18.288529+05:30	20260313222718_city_belongs_to_district	\N	\N	2026-03-14 03:57:18.27972+05:30	1
\.


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activity_logs (id, "userId", module, action, "entityType", "entityId", "oldValues", "newValues", "ipAddress", "createdAt") FROM stdin;
\.


--
-- Data for Name: agent_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.agent_profiles (id, "userId", "regionId", "monthlyTarget", "notificationSms", "notificationEmail", status, "createdAt", "updatedAt") FROM stdin;
cmmqrasal00ogrou9fmkd7f2x	cmmq3n2oa0000ggu97uco3y02	cmmqk0i1v00f0rou95p168jt2	0.00	t	t	t	2026-03-14 20:06:34.941	2026-03-14 20:06:34.941
cmmqrbhm500onrou94gt4w91e	cmmq5dpvr000vggu9w1q5t3ju	cmmqk0i1v00f0rou95p168jt2	0.00	t	t	t	2026-03-14 20:07:07.757	2026-03-14 20:07:07.757
cmmqruxrh0007yku9ka8ztffb	cmmq46nwo000nggu9cgejjtgn	cmmqk0i1v00f0rou95p168jt2	0.00	t	t	t	2026-03-14 20:22:15.149	2026-03-14 20:22:15.149
cmmqtbe75000cyku9ys9xuaxi	cmmq4audt000oggu95y2rr5cr	cmmqk17r800f6rou9jp0ckauk	0.00	t	t	t	2026-03-14 21:03:02.561	2026-03-14 21:03:02.561
cmmqtt5ba000hyku92k5gth3t	cmmq4j51d000pggu9uodxr62p	cmmqk1l4m00f9rou9ic4ipz8g	0.00	t	t	t	2026-03-14 21:16:50.854	2026-03-14 21:16:50.854
cmmqttmm7000jyku9x1ve18wx	cmmq52wx7000qggu9wcyft2as	cmmqk17r800f6rou9jp0ckauk	0.00	t	t	t	2026-03-14 21:17:13.279	2026-03-14 21:17:13.279
cmmquui5l000pyku9jf39cxys	cmmq54xhw000rggu9phx510ff	cmmqk0i1v00f0rou95p168jt2	0.00	t	t	t	2026-03-14 21:45:53.769	2026-03-14 21:45:53.769
cmmquvqc5000ryku92ocw2hv8	cmmq56fup000sggu9h5oyfe5p	cmmqk0i1v00f0rou95p168jt2	0.00	t	t	t	2026-03-14 21:46:51.029	2026-03-14 21:46:51.029
cmmquwa39000xyku9k19lvsnd	cmmq572lz000tggu92x3dddv7	cmmqk0i1v00f0rou95p168jt2	0.00	t	t	t	2026-03-14 21:47:16.629	2026-03-14 21:47:16.629
cmmquy1ey0010yku9ef92kd72	cmmq5cw4c000uggu9okdu71sh	cmmqk17r800f6rou9jp0ckauk	0.00	t	t	t	2026-03-14 21:48:38.698	2026-03-14 21:48:38.698
cmmqv0f090014yku9rhhocql6	cmmq5iq6l000wggu98uc4vuup	cmmqk1c2600f7rou9anpusjt9	0.00	t	t	t	2026-03-14 21:50:29.625	2026-03-14 21:50:29.625
cmmqv0v6s0019yku99h272xw7	cmmq5kwiu000xggu99o2vjv2s	cmmqk17r800f6rou9jp0ckauk	0.00	t	t	t	2026-03-14 21:50:50.596	2026-03-14 21:50:50.596
cmmqv5tdk001cyku95704wqxh	cmmq5m2m5000yggu9a4jyk20b	cmmqk0i1v00f0rou95p168jt2	0.00	t	t	t	2026-03-14 21:54:41.528	2026-03-14 21:54:41.528
\.


--
-- Data for Name: cities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cities (id, "regionId", name, status, "createdAt", "updatedAt", "districtId") FROM stdin;
cmmqk1nh300farou9btkjplmv	cmmqk0i1v00f0rou95p168jt2	Western Province	t	2026-03-14 16:43:31.479	2026-03-14 16:43:31.479	\N
cmmqk5ojx00hlrou9m39vvyrh	cmmqk106f00f4rou9qvkcxud8	Bentota	t	2026-03-14 16:46:39.5	2026-03-14 16:46:39.5	cmmqk5kll00fsrou9ro7v6mya
cmmqk5ok200hmrou981rup84t	cmmqk106f00f4rou9qvkcxud8	Deniyaya	t	2026-03-14 16:46:39.506	2026-03-14 16:46:39.506	cmmqk5kls00furou9gdtgtcn5
cmmqk5ok800hnrou9bvr65r64	cmmqk106f00f4rou9qvkcxud8	Hambantota	t	2026-03-14 16:46:39.512	2026-03-14 16:46:39.512	cmmqk5klp00ftrou9rh543sde
cmmqk5okd00horou95u1yk1ct	cmmqk106f00f4rou9qvkcxud8	Hikkaduwa	t	2026-03-14 16:46:39.517	2026-03-14 16:46:39.517	cmmqk5kll00fsrou9ro7v6mya
cmmqk5okj00hprou96c4rzb96	cmmqk106f00f4rou9qvkcxud8	Kataragama	t	2026-03-14 16:46:39.523	2026-03-14 16:46:39.523	cmmqk5klp00ftrou9rh543sde
cmmqk5oko00hqrou9d99bg0r7	cmmqk106f00f4rou9qvkcxud8	Matara	t	2026-03-14 16:46:39.528	2026-03-14 16:46:39.528	cmmqk5kls00furou9gdtgtcn5
cmmqk5okt00hrrou95ub1mz7v	cmmqk106f00f4rou9qvkcxud8	Tangalle	t	2026-03-14 16:46:39.533	2026-03-14 16:46:39.533	cmmqk5kls00furou9gdtgtcn5
cmmqk5okz00hsrou9zih79exs	cmmqk106f00f4rou9qvkcxud8	Tissamaharama	t	2026-03-14 16:46:39.539	2026-03-14 16:46:39.539	cmmqk5klp00ftrou9rh543sde
cmmqk5ol500htrou9l14ka689	cmmqk106f00f4rou9qvkcxud8	Weligama	t	2026-03-14 16:46:39.545	2026-03-14 16:46:39.545	cmmqk5kls00furou9gdtgtcn5
cmmqk5olb00hurou9c3pxf7kp	cmmqk106f00f4rou9qvkcxud8	Yala region towns	t	2026-03-14 16:46:39.551	2026-03-14 16:46:39.551	cmmqk5klp00ftrou9rh543sde
cmmqk5olg00hvrou9pnay91ou	cmmqk1i3000f8rou9dncg2uss	Badulla	t	2026-03-14 16:46:39.556	2026-03-14 16:46:39.556	cmmqk5klx00fvrou9mdouzzec
cmmqk5oll00hwrou9h6b3v641	cmmqk1i3000f8rou9dncg2uss	Bandarawela	t	2026-03-14 16:46:39.561	2026-03-14 16:46:39.561	cmmqk5klx00fvrou9mdouzzec
cmmqk5om500hxrou9jjli5brj	cmmqk1i3000f8rou9dncg2uss	Bibile	t	2026-03-14 16:46:39.581	2026-03-14 16:46:39.581	cmmqk5km000fwrou9g7fxkgxw
cmmqk5omb00hyrou905mi1x7f	cmmqk1i3000f8rou9dncg2uss	Haputale	t	2026-03-14 16:46:39.587	2026-03-14 16:46:39.587	cmmqk5klx00fvrou9mdouzzec
cmmqk5omg00hzrou9mflz9q0v	cmmqk1i3000f8rou9dncg2uss	Monaragala	t	2026-03-14 16:46:39.592	2026-03-14 16:46:39.592	cmmqk5km000fwrou9g7fxkgxw
cmmqk5oml00i0rou9794v5frm	cmmqk1i3000f8rou9dncg2uss	Wellawaya	t	2026-03-14 16:46:39.597	2026-03-14 16:46:39.597	cmmqk5km000fwrou9g7fxkgxw
cmmqk5omq00i1rou9n8e971lg	cmmqk0i1v00f0rou95p168jt2	Beruwala	t	2026-03-14 16:46:39.602	2026-03-14 16:46:39.602	cmmqk5kmb00fzrou9olmvf3hh
cmmqk5omw00i2rou950uacy3s	cmmqk0i1v00f0rou95p168jt2	Colombo	t	2026-03-14 16:46:39.607	2026-03-14 16:46:39.607	cmmqk5km400fxrou96mvmxql0
cmmqk5on700i4rou93qasabha	cmmqk0i1v00f0rou95p168jt2	Gampaha	t	2026-03-14 16:46:39.619	2026-03-14 16:46:39.619	cmmqk5km700fyrou9tb0dn7i0
cmmqk5onc00i5rou9c1rjp7g5	cmmqk0i1v00f0rou95p168jt2	Hanwella	t	2026-03-14 16:46:39.624	2026-03-14 16:46:39.624	cmmqk5km400fxrou96mvmxql0
cmmqk5oni00i6rou967q9kvaf	cmmqk0i1v00f0rou95p168jt2	Homagama	t	2026-03-14 16:46:39.63	2026-03-14 16:46:39.63	cmmqk5km400fxrou96mvmxql0
cmmqk5onn00i7rou9uflf9m45	cmmqk0i1v00f0rou95p168jt2	Horana	t	2026-03-14 16:46:39.635	2026-03-14 16:46:39.635	cmmqk5kmb00fzrou9olmvf3hh
cmmqk5ons00i8rou91fzlyrzl	cmmqk0i1v00f0rou95p168jt2	Ingiriya	t	2026-03-14 16:46:39.64	2026-03-14 16:46:39.64	cmmqk5kmb00fzrou9olmvf3hh
cmmqk5oo400iarou98mevk1mx	cmmqk0i1v00f0rou95p168jt2	Kalutara	t	2026-03-14 16:46:39.652	2026-03-14 16:46:39.652	cmmqk5kmb00fzrou9olmvf3hh
cmmqk5ooa00ibrou97ku6qlw5	cmmqk0i1v00f0rou95p168jt2	Katunayake	t	2026-03-14 16:46:39.658	2026-03-14 16:46:39.658	cmmqk5km700fyrou9tb0dn7i0
cmmqk5oog00icrou99odxyvfd	cmmqk0i1v00f0rou95p168jt2	Kelaniya	t	2026-03-14 16:46:39.664	2026-03-14 16:46:39.664	cmmqk5km700fyrou9tb0dn7i0
cmmqk5oom00idrou9pdxobzep	cmmqk0i1v00f0rou95p168jt2	Kesbewa	t	2026-03-14 16:46:39.67	2026-03-14 16:46:39.67	cmmqk5km400fxrou96mvmxql0
cmmqk5oor00ierou924wdeatx	cmmqk0i1v00f0rou95p168jt2	Kolonnawa	t	2026-03-14 16:46:39.675	2026-03-14 16:46:39.675	cmmqk5km400fxrou96mvmxql0
cmmqk5oow00ifrou9cluo4tvc	cmmqk0i1v00f0rou95p168jt2	Maharagama	t	2026-03-14 16:46:39.68	2026-03-14 16:46:39.68	cmmqk5km400fxrou96mvmxql0
cmmqk5op100igrou9ynk7sqd6	cmmqk0i1v00f0rou95p168jt2	Minuwangoda	t	2026-03-14 16:46:39.685	2026-03-14 16:46:39.685	cmmqk5km700fyrou9tb0dn7i0
cmmqk5op600ihrou9txq6539k	cmmqk0i1v00f0rou95p168jt2	Moratuwa	t	2026-03-14 16:46:39.69	2026-03-14 16:46:39.69	cmmqk5km400fxrou96mvmxql0
cmmqk5opb00iirou9n826w15p	cmmqk0i1v00f0rou95p168jt2	Negombo	t	2026-03-14 16:46:39.695	2026-03-14 16:46:39.695	cmmqk5km700fyrou9tb0dn7i0
cmmqk5opg00ijrou9taqyw9f5	cmmqk0i1v00f0rou95p168jt2	Panadura	t	2026-03-14 16:46:39.699	2026-03-14 16:46:39.699	cmmqk5kmb00fzrou9olmvf3hh
cmmqk5opk00ikrou92l38x5sj	cmmqk0i1v00f0rou95p168jt2	Sri Jayawardenepura Kotte	t	2026-03-14 16:46:39.704	2026-03-14 16:46:39.704	cmmqk5km400fxrou96mvmxql0
cmmqk5opp00ilrou9hpa8apq9	cmmqk0i1v00f0rou95p168jt2	Wadduwa	t	2026-03-14 16:46:39.709	2026-03-14 16:46:39.709	cmmqk5kmb00fzrou9olmvf3hh
cmmqk5opu00imrou9wqcsgmx3	cmmqk0i1v00f0rou95p168jt2	Wattala	t	2026-03-14 16:46:39.713	2026-03-14 16:46:39.713	cmmqk5km700fyrou9tb0dn7i0
cmmqk66qo00nxrou9fjconvwc	cmmqk0i1v00f0rou95p168jt2	Dehiwala-Mount Lavinia	t	2026-03-14 16:47:03.072	2026-03-14 16:47:03.072	cmmqk5km400fxrou96mvmxql0
cmmqk70vb00o5rou9kwmqbc5c	cmmqk0i1v00f0rou95p168jt2	Ja-Ela	t	2026-03-14 16:47:42.119	2026-03-14 16:47:42.119	cmmqk5km700fyrou9tb0dn7i0
cmmqk7jdp00oarou9049qw8s9	cmmqk106f00f4rou9qvkcxud8	Galle	t	2026-03-14 16:48:06.109	2026-03-14 16:48:06.109	cmmqk5kll00fsrou9ro7v6mya
cmmqush6l000lyku9sk8ydvna	cmmqk0i1v00f0rou95p168jt2	Kaduwela	t	2026-03-14 21:44:19.195	2026-03-14 21:44:19.195	cmmqk5km400fxrou96mvmxql0
cmmqk5oap00g0rou9u3f8cqr3	cmmqk0ndy00f1rou9vmaw58eq	Bandarawela	t	2026-03-14 16:46:39.168	2026-03-14 16:46:39.168	cmmqk5kk000fdrou99l54vfma
cmmqk5ob500g1rou92fprvf39	cmmqk0ndy00f1rou9vmaw58eq	Dambulla	t	2026-03-14 16:46:39.185	2026-03-14 16:46:39.185	cmmqk5kjw00fcrou93b6u5ceu
cmmqk5ob900g2rou9jdriihmy	cmmqk0ndy00f1rou9vmaw58eq	Galewela	t	2026-03-14 16:46:39.189	2026-03-14 16:46:39.189	cmmqk5kjw00fcrou93b6u5ceu
cmmqk5obe00g3rou9p5vjhhaw	cmmqk0ndy00f1rou9vmaw58eq	Gampola	t	2026-03-14 16:46:39.194	2026-03-14 16:46:39.194	cmmqk5kfm00fbrou9qnnwbf5b
cmmqk5obj00g4rou9ck3e1by4	cmmqk0ndy00f1rou9vmaw58eq	Hatton	t	2026-03-14 16:46:39.199	2026-03-14 16:46:39.199	cmmqk5kk000fdrou99l54vfma
cmmqk5obo00g5rou965hjttt2	cmmqk0ndy00f1rou9vmaw58eq	Kadugannawa	t	2026-03-14 16:46:39.204	2026-03-14 16:46:39.204	cmmqk5kfm00fbrou9qnnwbf5b
cmmqk5obu00g6rou9c1mxp6s0	cmmqk0ndy00f1rou9vmaw58eq	Kandy	t	2026-03-14 16:46:39.21	2026-03-14 16:46:39.21	cmmqk5kfm00fbrou9qnnwbf5b
cmmqk5oc100g7rou9yfr283x6	cmmqk0ndy00f1rou9vmaw58eq	Matale	t	2026-03-14 16:46:39.217	2026-03-14 16:46:39.217	cmmqk5kjw00fcrou93b6u5ceu
cmmqk5oc700g8rou9qyiv7hwn	cmmqk0ndy00f1rou9vmaw58eq	Naula	t	2026-03-14 16:46:39.223	2026-03-14 16:46:39.223	cmmqk5kjw00fcrou93b6u5ceu
cmmqk5ocd00g9rou9p5egw0ah	cmmqk0ndy00f1rou9vmaw58eq	Nawalapitiya	t	2026-03-14 16:46:39.229	2026-03-14 16:46:39.229	cmmqk5kfm00fbrou9qnnwbf5b
cmmqk5oci00garou99s3pnf3w	cmmqk0ndy00f1rou9vmaw58eq	Nuwara Eliya	t	2026-03-14 16:46:39.233	2026-03-14 16:46:39.233	cmmqk5kk000fdrou99l54vfma
cmmqk5ocm00gbrou9xhn8tqm5	cmmqk0ndy00f1rou9vmaw58eq	Peradeniya	t	2026-03-14 16:46:39.238	2026-03-14 16:46:39.238	cmmqk5kfm00fbrou9qnnwbf5b
cmmqk5ocr00gcrou98nybmdoy	cmmqk0ndy00f1rou9vmaw58eq	Talawakelle	t	2026-03-14 16:46:39.243	2026-03-14 16:46:39.243	cmmqk5kk000fdrou99l54vfma
cmmqk5ocw00gdrou9qm8bqe68	cmmqk0ndy00f1rou9vmaw58eq	Ukuwela	t	2026-03-14 16:46:39.248	2026-03-14 16:46:39.248	cmmqk5kjw00fcrou93b6u5ceu
cmmqk5od200gerou9lwr0rkvv	cmmqk14ek00f5rou9i99chye2	Ampara	t	2026-03-14 16:46:39.254	2026-03-14 16:46:39.254	cmmqk5kk400ferou9so4oiq5g
cmmqk5od700gfrou9wmtwq6np	cmmqk14ek00f5rou9i99chye2	Batticaloa	t	2026-03-14 16:46:39.259	2026-03-14 16:46:39.259	cmmqk5kk900ffrou9asw9cizd
cmmqk5odd00ggrou9w4pbado8	cmmqk14ek00f5rou9i99chye2	Eravur	t	2026-03-14 16:46:39.264	2026-03-14 16:46:39.264	cmmqk5kk900ffrou9asw9cizd
cmmqk5odi00ghrou9h7mr60fq	cmmqk14ek00f5rou9i99chye2	Kalmunai	t	2026-03-14 16:46:39.27	2026-03-14 16:46:39.27	cmmqk5kk900ffrou9asw9cizd
cmmqk5odn00girou9d927zek9	cmmqk14ek00f5rou9i99chye2	Kattankudy	t	2026-03-14 16:46:39.275	2026-03-14 16:46:39.275	cmmqk5kk900ffrou9asw9cizd
cmmqk5ods00gjrou9nldtg07r	cmmqk14ek00f5rou9i99chye2	Kinniya	t	2026-03-14 16:46:39.28	2026-03-14 16:46:39.28	cmmqk5kke00fgrou90v30mxdq
cmmqk5odx00gkrou9aetr1n1f	cmmqk14ek00f5rou9i99chye2	Nilaveli	t	2026-03-14 16:46:39.284	2026-03-14 16:46:39.284	cmmqk5kke00fgrou90v30mxdq
cmmqk5oe100glrou9zf3omdq5	cmmqk14ek00f5rou9i99chye2	Pottuvil	t	2026-03-14 16:46:39.289	2026-03-14 16:46:39.289	cmmqk5kk400ferou9so4oiq5g
cmmqk5oe600gmrou9bzei363x	cmmqk14ek00f5rou9i99chye2	Trincomalee	t	2026-03-14 16:46:39.294	2026-03-14 16:46:39.294	cmmqk5kke00fgrou90v30mxdq
cmmqk5oeb00gnrou9nosuntu4	cmmqk1c2600f7rou9anpusjt9	Anuradhapura	t	2026-03-14 16:46:39.299	2026-03-14 16:46:39.299	cmmqk5kki00fhrou9nq6wpg5g
cmmqk5oeg00gorou93kiite5r	cmmqk1c2600f7rou9anpusjt9	Kaduruwela	t	2026-03-14 16:46:39.304	2026-03-14 16:46:39.304	cmmqk5kkm00firou9kk3l3zop
cmmqk5oel00gprou9ftev4dyl	cmmqk1c2600f7rou9anpusjt9	Mihintale	t	2026-03-14 16:46:39.309	2026-03-14 16:46:39.309	cmmqk5kki00fhrou9nq6wpg5g
cmmqk5oeq00gqrou9fkkwgisz	cmmqk1c2600f7rou9anpusjt9	Nochchiyagama	t	2026-03-14 16:46:39.314	2026-03-14 16:46:39.314	cmmqk5kki00fhrou9nq6wpg5g
cmmqk5oew00grrou9mhisc2vr	cmmqk1c2600f7rou9anpusjt9	Polonnaruwa	t	2026-03-14 16:46:39.32	2026-03-14 16:46:39.32	cmmqk5kkm00firou9kk3l3zop
cmmqk5of100gsrou9x0k7grzc	cmmqk17r800f6rou9jp0ckauk	Chilaw	t	2026-03-14 16:46:39.325	2026-03-14 16:46:39.325	cmmqk5kku00fkrou9y1shbndf
cmmqk5of700gtrou9cblmydq3	cmmqk17r800f6rou9jp0ckauk	Kuliyapitiya	t	2026-03-14 16:46:39.33	2026-03-14 16:46:39.33	cmmqk5kkp00fjrou94knzk580
cmmqk5ofe00gurou9id0exr3g	cmmqk17r800f6rou9jp0ckauk	Kurunegala	t	2026-03-14 16:46:39.338	2026-03-14 16:46:39.338	cmmqk5kkp00fjrou94knzk580
cmmqk5ofk00gvrou9wq7ov9u2	cmmqk17r800f6rou9jp0ckauk	Polgahawela	t	2026-03-14 16:46:39.344	2026-03-14 16:46:39.344	cmmqk5kkp00fjrou94knzk580
cmmqk5ofq00gwrou92nnpcen3	cmmqk17r800f6rou9jp0ckauk	Puttalam	t	2026-03-14 16:46:39.35	2026-03-14 16:46:39.35	cmmqk5kku00fkrou9y1shbndf
cmmqk5ofw00gxrou97yvh9u33	cmmqk17r800f6rou9jp0ckauk	Wariyapola	t	2026-03-14 16:46:39.355	2026-03-14 16:46:39.355	cmmqk5kkp00fjrou94knzk580
cmmqk5og200gyrou9uvna8aue	cmmqk17r800f6rou9jp0ckauk	Wennappuwa	t	2026-03-14 16:46:39.361	2026-03-14 16:46:39.361	cmmqk5kku00fkrou9y1shbndf
cmmqk5og700gzrou96o3nj282	cmmqk0vjf00f3rou96ju2m5ak	Chavakachcheri	t	2026-03-14 16:46:39.367	2026-03-14 16:46:39.367	cmmqk5kky00flrou9cbuashok
cmmqk5ogd00h0rou992rp8o79	cmmqk0vjf00f3rou96ju2m5ak	Jaffna	t	2026-03-14 16:46:39.373	2026-03-14 16:46:39.373	cmmqk5kky00flrou9cbuashok
cmmqk5ogj00h1rou9re4y8vz3	cmmqk0vjf00f3rou96ju2m5ak	Kilinochchi	t	2026-03-14 16:46:39.379	2026-03-14 16:46:39.379	cmmqk5kl100fmrou9f9ame6vy
cmmqk5ogo00h2rou9v7ad2jf7	cmmqk0vjf00f3rou96ju2m5ak	Mannar	t	2026-03-14 16:46:39.384	2026-03-14 16:46:39.384	cmmqk5kl400fnrou91okazwme
cmmqk5ogv00h3rou9pb3roq3z	cmmqk0vjf00f3rou96ju2m5ak	Mullaitivu	t	2026-03-14 16:46:39.391	2026-03-14 16:46:39.391	cmmqk5kl700forou94k3nhua3
cmmqk5oh100h4rou9xc6ikud3	cmmqk0vjf00f3rou96ju2m5ak	Omanthai	t	2026-03-14 16:46:39.397	2026-03-14 16:46:39.397	cmmqk5kla00fprou9kzpogng3
cmmqk5oh600h5rou9oupcgdh0	cmmqk0vjf00f3rou96ju2m5ak	Paranthan	t	2026-03-14 16:46:39.402	2026-03-14 16:46:39.402	cmmqk5kl100fmrou9f9ame6vy
cmmqk5ohc00h6rou9wu9fv6qg	cmmqk0vjf00f3rou96ju2m5ak	Pesalai	t	2026-03-14 16:46:39.408	2026-03-14 16:46:39.408	cmmqk5kl400fnrou91okazwme
cmmqk5ohi00h7rou9blqn20ue	cmmqk0vjf00f3rou96ju2m5ak	Point Pedro	t	2026-03-14 16:46:39.413	2026-03-14 16:46:39.413	cmmqk5kky00flrou9cbuashok
cmmqk5ohn00h8rou9cx5xl72f	cmmqk0vjf00f3rou96ju2m5ak	Puthukkudiyiruppu	t	2026-03-14 16:46:39.419	2026-03-14 16:46:39.419	cmmqk5kl700forou94k3nhua3
cmmqk5ohs00h9rou9tmin4zva	cmmqk0vjf00f3rou96ju2m5ak	Valvettithurai	t	2026-03-14 16:46:39.424	2026-03-14 16:46:39.424	cmmqk5kky00flrou9cbuashok
cmmqk5ohy00harou9y1qhbwxm	cmmqk0vjf00f3rou96ju2m5ak	Vavuniya	t	2026-03-14 16:46:39.43	2026-03-14 16:46:39.43	cmmqk5kla00fprou9kzpogng3
cmmqk5oi400hbrou9t9s16zrb	cmmqk1l4m00f9rou9ic4ipz8g	Balangoda	t	2026-03-14 16:46:39.435	2026-03-14 16:46:39.435	cmmqk5klh00frrou9e676uebs
cmmqk5oi900hcrou9nfamvzvj	cmmqk1l4m00f9rou9ic4ipz8g	Embilipitiya	t	2026-03-14 16:46:39.441	2026-03-14 16:46:39.441	cmmqk5klh00frrou9e676uebs
cmmqk5oie00hdrou9fmnap56l	cmmqk1l4m00f9rou9ic4ipz8g	Kegalle	t	2026-03-14 16:46:39.446	2026-03-14 16:46:39.446	cmmqk5kld00fqrou9wuogm5qt
cmmqk5oiv00herou9fhphorkv	cmmqk1l4m00f9rou9ic4ipz8g	Rambukkana	t	2026-03-14 16:46:39.463	2026-03-14 16:46:39.463	cmmqk5kld00fqrou9wuogm5qt
cmmqk5oj100hfrou9pqe7f2hl	cmmqk1l4m00f9rou9ic4ipz8g	Ratnapura	t	2026-03-14 16:46:39.469	2026-03-14 16:46:39.469	cmmqk5klh00frrou9e676uebs
cmmqk5oj600hgrou9f9i78zm5	cmmqk1l4m00f9rou9ic4ipz8g	Warakapola	t	2026-03-14 16:46:39.474	2026-03-14 16:46:39.474	cmmqk5kld00fqrou9wuogm5qt
cmmqk5ojc00hhrou9wzmhdn4n	cmmqk106f00f4rou9qvkcxud8	Ahangama	t	2026-03-14 16:46:39.48	2026-03-14 16:46:39.48	cmmqk5kll00fsrou9ro7v6mya
cmmqk5ojh00hirou94pv5oagg	cmmqk106f00f4rou9qvkcxud8	Akuressa	t	2026-03-14 16:46:39.485	2026-03-14 16:46:39.485	cmmqk5kls00furou9gdtgtcn5
cmmqk5ojm00hjrou9trsct3ns	cmmqk106f00f4rou9qvkcxud8	Ambalangoda	t	2026-03-14 16:46:39.49	2026-03-14 16:46:39.49	cmmqk5kll00fsrou9ro7v6mya
cmmqk5ojr00hkrou9qsay6rlo	cmmqk106f00f4rou9qvkcxud8	Balapitiya	t	2026-03-14 16:46:39.495	2026-03-14 16:46:39.495	cmmqk5kll00fsrou9ro7v6mya
\.


--
-- Data for Name: city_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.city_assignments (id, "cityId", "agentId", "driverId", "createdAt", "updatedAt") FROM stdin;
cmmqrckcl00oprou9i785yfk9	cmmqk5opb00iirou9n826w15p	cmmqrasal00ogrou9fmkd7f2x	cmmqrasay00ohrou9lpf5xxs3	2026-03-14 20:07:57.957	2026-03-14 20:07:57.957
\.


--
-- Data for Name: company_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.company_profiles (id, "companyCode", "legalName", "brandName", "registrationNumber", "taxId", "vatNumber", "businessType", "industryType", "companyEmail", "companyPhone", "companyMobile", "whatsappNumber", website, "logoUrl", "profileImageUrl", description, "establishedDate", "isActive", "factoryName", "factoryLicenseNumber", "foodSafetyLicenseNumber", "dairyBoardRegistrationNumber", "processingCapacityLitersPerDay", "coldStorageCapacityLiters", "factoryPhone", "factoryEmail", "addressLine1", "addressLine2", street, city, district, province, "postalCode", country, latitude, longitude, "ownerName", "managingDirectorName", "operationsManagerName", "financeManagerName", "factoryManagerName", "primaryContactPerson", "primaryContactEmail", "primaryContactPhone", "emergencyContactName", "emergencyContactPhone", "businessOpenTime", "businessCloseTime", "factoryOpenTime", "factoryCloseTime", "deliveryStartTime", "deliveryEndTime", "workingDays", "distributionRegions", "fleetSize", "numberOfDrivers", "numberOfAgents", "dailyDeliveryCapacity", "supportsIslandwideDelivery", "hasSLS", "hasISO22000", "hasHACCP", "hasISO9001", "certificationNotes", "bankName", "bankBranch", "accountName", "accountNumber", "swiftCode", "paymentSupportEmail", "billingEmail", "defaultCurrency", timezone, language, "invoicePrefix", "orderPrefix", "clientPrefix", "agentPrefix", "driverPrefix", "stockPrefix", "createdAt", "updatedAt") FROM stdin;
cmmp6cfay0000c0u9xtgf7s94	VD	Vills Dairy PVT LTD	Vills Dairy	PV0054684	\N	\N	PRIVATE_LIMITED	DAIRY_MANUFACTURING_DISTRIBUTION			\N	\N	\N	/uploads/company/1773444101013-3fea8ba7a7d428e9.png	/uploads/company/1773429647195-ee810c3cbe200782.jpg	\N	\N	t	\N	\N	\N	\N	0	0	\N	\N		\N	\N						\N	\N	\N	\N	\N	\N	\N		\N		\N	\N	\N	\N	\N	\N	\N	\N	{}	{}	0	0	0	0	f	f	f	f	f	resr	\N	\N	\N	\N	\N	\N	\N	LKR	Asia/Colombo	en	INV-	ORD-	CLT-	AGT-	DRV-	STK-	2026-03-13 17:32:13.306	2026-03-13 23:21:42.077
\.


--
-- Data for Name: company_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.company_settings (id, name, email, phone, "contactPersonName", "contactEmail", country, street, "addressNo", "postalCode", website, "taxId", "openingTime", "closingTime", "createdAt", "updatedAt") FROM stdin;
default-company	Vills Dairy	info@villsdairy.local	0780000000	\N	\N	Sri Lanka	\N	\N	\N	\N	\N	\N	\N	2026-03-13 11:08:43.413	2026-03-13 11:08:43.413
\.


--
-- Data for Name: discounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.discounts (id, "orderId", "shopId", "agentId", "discountType", "discountValue", "approvalStatus", "approvedById", "approvedAt", reason, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: dispatches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.dispatches (id, "orderId", "driverId", "dispatchDate", "deliveredDate", "deliveryStatus", remarks, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: districts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.districts (id, name, code, status, "regionId", "createdAt", "updatedAt") FROM stdin;
cmmqk5kfm00fbrou9qnnwbf5b	Kandy	KANDY	t	cmmqk0ndy00f1rou9vmaw58eq	2026-03-14 16:46:34.162	2026-03-14 16:46:34.162
cmmqk5kjw00fcrou93b6u5ceu	Matale	MATALE	t	cmmqk0ndy00f1rou9vmaw58eq	2026-03-14 16:46:34.316	2026-03-14 16:46:34.316
cmmqk5kk000fdrou99l54vfma	Nuwara Eliya	NUWARA_ELIYA	t	cmmqk0ndy00f1rou9vmaw58eq	2026-03-14 16:46:34.32	2026-03-14 16:46:34.32
cmmqk5kk400ferou9so4oiq5g	Ampara	AMPARA	t	cmmqk14ek00f5rou9i99chye2	2026-03-14 16:46:34.324	2026-03-14 16:46:34.324
cmmqk5kk900ffrou9asw9cizd	Batticaloa	BATTICALOA	t	cmmqk14ek00f5rou9i99chye2	2026-03-14 16:46:34.329	2026-03-14 16:46:34.329
cmmqk5kke00fgrou90v30mxdq	Trincomalee	TRINCOMALEE	t	cmmqk14ek00f5rou9i99chye2	2026-03-14 16:46:34.334	2026-03-14 16:46:34.334
cmmqk5kki00fhrou9nq6wpg5g	Anuradhapura	ANURADHAPURA	t	cmmqk1c2600f7rou9anpusjt9	2026-03-14 16:46:34.338	2026-03-14 16:46:34.338
cmmqk5kkm00firou9kk3l3zop	Polonnaruwa	POLONNARUWA	t	cmmqk1c2600f7rou9anpusjt9	2026-03-14 16:46:34.342	2026-03-14 16:46:34.342
cmmqk5kkp00fjrou94knzk580	Kurunegala	KURUNEGALA	t	cmmqk17r800f6rou9jp0ckauk	2026-03-14 16:46:34.345	2026-03-14 16:46:34.345
cmmqk5kku00fkrou9y1shbndf	Puttalam	PUTTALAM	t	cmmqk17r800f6rou9jp0ckauk	2026-03-14 16:46:34.35	2026-03-14 16:46:34.35
cmmqk5kky00flrou9cbuashok	Jaffna	JAFFNA	t	cmmqk0vjf00f3rou96ju2m5ak	2026-03-14 16:46:34.354	2026-03-14 16:46:34.354
cmmqk5kl100fmrou9f9ame6vy	Kilinochchi	KILINOCHCHI	t	cmmqk0vjf00f3rou96ju2m5ak	2026-03-14 16:46:34.357	2026-03-14 16:46:34.357
cmmqk5kl400fnrou91okazwme	Mannar	MANNAR	t	cmmqk0vjf00f3rou96ju2m5ak	2026-03-14 16:46:34.36	2026-03-14 16:46:34.36
cmmqk5kl700forou94k3nhua3	Mullaitivu	MULLAITIVU	t	cmmqk0vjf00f3rou96ju2m5ak	2026-03-14 16:46:34.363	2026-03-14 16:46:34.363
cmmqk5kla00fprou9kzpogng3	Vavuniya	VAVUNIYA	t	cmmqk0vjf00f3rou96ju2m5ak	2026-03-14 16:46:34.366	2026-03-14 16:46:34.366
cmmqk5kld00fqrou9wuogm5qt	Kegalle	KEGALLE	t	cmmqk1l4m00f9rou9ic4ipz8g	2026-03-14 16:46:34.369	2026-03-14 16:46:34.369
cmmqk5klh00frrou9e676uebs	Ratnapura	RATNAPURA	t	cmmqk1l4m00f9rou9ic4ipz8g	2026-03-14 16:46:34.373	2026-03-14 16:46:34.373
cmmqk5kll00fsrou9ro7v6mya	Galle	GALLE	t	cmmqk106f00f4rou9qvkcxud8	2026-03-14 16:46:34.377	2026-03-14 16:46:34.377
cmmqk5klp00ftrou9rh543sde	Hambantota	HAMBANTOTA	t	cmmqk106f00f4rou9qvkcxud8	2026-03-14 16:46:34.381	2026-03-14 16:46:34.381
cmmqk5kls00furou9gdtgtcn5	Matara	MATARA	t	cmmqk106f00f4rou9qvkcxud8	2026-03-14 16:46:34.384	2026-03-14 16:46:34.384
cmmqk5klx00fvrou9mdouzzec	Badulla	BADULLA	t	cmmqk1i3000f8rou9dncg2uss	2026-03-14 16:46:34.389	2026-03-14 16:46:34.389
cmmqk5km000fwrou9g7fxkgxw	Monaragala	MONARAGALA	t	cmmqk1i3000f8rou9dncg2uss	2026-03-14 16:46:34.392	2026-03-14 16:46:34.392
cmmqk5km400fxrou96mvmxql0	Colombo	COLOMBO	t	cmmqk0i1v00f0rou95p168jt2	2026-03-14 16:46:34.396	2026-03-14 16:46:34.396
cmmqk5km700fyrou9tb0dn7i0	Gampaha	GAMPAHA	t	cmmqk0i1v00f0rou95p168jt2	2026-03-14 16:46:34.399	2026-03-14 16:46:34.399
cmmqk5kmb00fzrou9olmvf3hh	Kalutara	KALUTARA	t	cmmqk0i1v00f0rou95p168jt2	2026-03-14 16:46:34.403	2026-03-14 16:46:34.403
\.


--
-- Data for Name: driver_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.driver_profiles (id, "userId", "regionId", "vehicleNumber", "licenseNumber", "fuelQuotaDaily", "notificationSms", "notificationEmail", status, "createdAt", "updatedAt") FROM stdin;
cmmqrasay00ohrou9lpf5xxs3	cmmq7xcc70010ggu99sfky9au	cmmqk0i1v00f0rou95p168jt2	\N	\N	0.00	t	t	t	2026-03-14 20:06:34.954	2026-03-14 20:06:34.954
cmmqtbe7h000dyku9qhd2hobg	cmmq7yhqy001oggu9hqdstf9q	cmmqk17r800f6rou9jp0ckauk	\N	\N	0.00	t	t	t	2026-03-14 21:03:02.573	2026-03-14 21:03:02.573
cmmquvqce000syku9941fa5hh	cmmq7xvtq001nggu9vw40hxbi	cmmqk0i1v00f0rou95p168jt2	\N	\N	0.00	t	t	t	2026-03-14 21:46:51.038	2026-03-14 21:46:51.038
\.


--
-- Data for Name: fuel_allocations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fuel_allocations (id, "driverId", "tripDate", "allocatedLiters", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invoices (id, "invoiceNo", "orderId", "shopId", subtotal, "discountTotal", "taxTotal", total, "paymentStatus", "issuedAt", "dueDate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: notification_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notification_templates (id, name, channel, "triggerEvent", subject, body, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, "userId", "shopId", channel, "triggerEvent", title, message, "sentStatus", "sentAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, "orderId", "productId", qty, "unitPrice", "discountType", "discountValue", "lineTotal") FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, "orderNo", "shopId", "placedByUserId", "agentId", "driverId", "regionId", "cityId", "paymentType", "paymentStatus", "approvalStatus", "dispatchStatus", "orderStatus", subtotal, "discountTotal", "taxTotal", "grandTotal", notes, "orderedAt", "deliveryDate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments (id, "invoiceId", "shopId", "paymentMethod", amount, "referenceNo", "paidAt", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.permissions (id, name, code, module, "createdAt", "updatedAt") FROM stdin;
cmmo2tx2w000mvku9plowyz9a	View sales & target	SALES_TARGET_VIEW	Sales & Target	2026-03-12 23:06:04.856	2026-03-13 12:01:36.116
cmmo2tx2x000nvku9wrm2exu0	View payments & invoices	PAYMENT_VIEW	Payments & Invoices	2026-03-12 23:06:04.857	2026-03-13 12:01:36.117
cmmo2tx2y000ovku9o9vhqsmf	View reports	REPORT_VIEW	Reports & Export	2026-03-12 23:06:04.858	2026-03-13 12:01:36.118
cmmo2tx2z000pvku9099syha1	View logs	ACTIVITY_LOG_VIEW	Activity Logs	2026-03-12 23:06:04.859	2026-03-13 12:01:36.12
cmmo2tx2a0004vku9kyay71ng	Create region	REGION_CREATE	Region & Territory	2026-03-12 23:06:04.834	2026-03-13 12:01:36.088
cmmo2tx2d0005vku9665oj9l6	Update region	REGION_UPDATE	Region & Territory	2026-03-12 23:06:04.837	2026-03-13 12:01:36.09
cmmo2tx2f0006vku9spxzyl5d	Delete region	REGION_DELETE	Region & Territory	2026-03-12 23:06:04.839	2026-03-13 12:01:36.092
cmmo2tx2g0007vku9qascautv	Assign agents & drivers	REGION_ASSIGN_STAFF	Region & Territory	2026-03-12 23:06:04.84	2026-03-13 12:01:36.093
cmmo2tx2i0008vku92sn4bp6r	Create client	CLIENT_CREATE	Clients	2026-03-12 23:06:04.842	2026-03-13 12:01:36.096
cmmo2tx2k0009vku9vnzpacjs	Update client	CLIENT_UPDATE	Clients	2026-03-12 23:06:04.844	2026-03-13 12:01:36.098
cmmo2tx2m000avku9iu2yfsf9	Delete client	CLIENT_DELETE	Clients	2026-03-12 23:06:04.845	2026-03-13 12:01:36.1
cmmo2tx2m000bvku9ftggpx7j	Create agent	AGENT_CREATE	Agents	2026-03-12 23:06:04.846	2026-03-13 12:01:36.101
cmmo2tx2n000cvku94lb3b2jd	Update agent	AGENT_UPDATE	Agents	2026-03-12 23:06:04.847	2026-03-13 12:01:36.103
cmmo2tx2o000dvku92mink4de	Delete agent	AGENT_DELETE	Agents	2026-03-12 23:06:04.848	2026-03-13 12:01:36.104
cmmo2tx2p000evku9783ppjmq	Create driver	DRIVER_CREATE	Drivers	2026-03-12 23:06:04.849	2026-03-13 12:01:36.106
cmmo2tx2q000fvku9suhkb9z4	Update driver	DRIVER_UPDATE	Drivers	2026-03-12 23:06:04.85	2026-03-13 12:01:36.107
cmmo2tx2r000gvku9gc94lq0g	Delete driver	DRIVER_DELETE	Drivers	2026-03-12 23:06:04.851	2026-03-13 12:01:36.108
cmmo2tx2s000hvku91z4h0ovq	View orders	ORDER_VIEW	Orders	2026-03-12 23:06:04.852	2026-03-13 12:01:36.11
cmmo2tx2t000ivku9ig7kjpnr	Create order	ORDER_CREATE	Orders	2026-03-12 23:06:04.853	2026-03-13 12:01:36.111
cmmo2tx2u000jvku9hipazijx	Approve / reject orders	ORDER_APPROVE	Orders	2026-03-12 23:06:04.854	2026-03-13 12:01:36.112
cmmo2tx2v000kvku975e3ukby	View returns	RETURN_VIEW	Returns	2026-03-12 23:06:04.855	2026-03-13 12:01:36.114
cmmo2tx2v000lvku9jtks8ozt	Approve / reject returns	RETURN_APPROVE	Returns	2026-03-12 23:06:04.855	2026-03-13 12:01:36.115
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, name, sku, "unitType", "unitVolume", price, status, "createdAt", "updatedAt") FROM stdin;
cmmnw9tic0000fsu9m3wyf0xg	Vanilla Flavoured Milk	MILK-VAN-250	Bottle	250ml	100.00	t	2026-03-12 20:02:29.412	2026-03-12 20:02:29.412
cmmnwb4j00002fsu9nd3e4utp	Strawberry Flavoured Milk	MILK-STR-250	Bottle	250ml	100.00	t	2026-03-12 20:03:30.348	2026-03-12 20:03:30.348
cmmnwalwx0001fsu9zfa6nhfd	Chocolate Flavoured Milk	MILK-CHO-250	Bottle	250ml	100.00	t	2026-03-12 20:03:06.225	2026-03-12 20:03:35.655
\.


--
-- Data for Name: regions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.regions (id, name, code, status, "createdAt", "updatedAt") FROM stdin;
cmmqk0i1v00f0rou95p168jt2	Western Province	WESTERN_PROVINCE	t	2026-03-14 16:42:37.795	2026-03-14 16:42:37.795
cmmqk0ndy00f1rou9vmaw58eq	Central Province	CENTRAL_PROVINCE	t	2026-03-14 16:42:44.71	2026-03-14 16:42:44.71
cmmqk0vjf00f3rou96ju2m5ak	Northern Province	NORTHERN_PROVINCE	t	2026-03-14 16:42:55.275	2026-03-14 16:42:55.275
cmmqk106f00f4rou9qvkcxud8	Southern Province	SOUTHERN_PROVINCE	t	2026-03-14 16:43:01.287	2026-03-14 16:43:01.287
cmmqk14ek00f5rou9i99chye2	Eastern Province	EASTERN_PROVINCE	t	2026-03-14 16:43:06.764	2026-03-14 16:43:06.764
cmmqk17r800f6rou9jp0ckauk	North Western Province	NORTH_WESTERN_PROVINCE	t	2026-03-14 16:43:11.108	2026-03-14 16:43:11.108
cmmqk1c2600f7rou9anpusjt9	North Central Province	NORTH_CENTRAL_PROVINCE	t	2026-03-14 16:43:16.686	2026-03-14 16:43:16.686
cmmqk1i3000f8rou9dncg2uss	Uva Province	UVA_PROVINCE	t	2026-03-14 16:43:24.492	2026-03-14 16:43:24.492
cmmqk1l4m00f9rou9ic4ipz8g	Sabaragamuwa Province	SABARAGAMUWA_PROVINCE	t	2026-03-14 16:43:28.438	2026-03-14 16:43:28.438
\.


--
-- Data for Name: return_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.return_items (id, "returnId", "productId", "goodQty", "brokenQty", "missingQty") FROM stdin;
cmmnzus840001uou9ri41w2vh	cmmnzus7z0000uou9l0nqoy53	cmmnwb4j00002fsu9nd3e4utp	1	1	1
\.


--
-- Data for Name: returns; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.returns (id, "returnNo", "shopId", "agentId", "driverId", status, "requestedAt", "approvedAt", notes, "createdAt", "updatedAt") FROM stdin;
cmmnzus7z0000uou9l0nqoy53	RET-000001	cmmnxnwbl0000bsu91387ugwm	\N	\N	APPROVED	2026-03-12 21:42:46.366	2026-03-12 22:22:12.422	54	2026-03-12 21:42:46.366	2026-03-12 22:22:12.431
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.role_permissions (id, "roleId", "permissionId") FROM stdin;
cmmo2tx3j000qvku957pdmdao	cmmnqncdx0000fou9arvul6lz	cmmo2tx2a0004vku9kyay71ng
cmmo2tx3m000rvku9haef1jfv	cmmnqncdx0000fou9arvul6lz	cmmo2tx2d0005vku9665oj9l6
cmmo2tx3o000svku9bzxw5vxn	cmmnqncdx0000fou9arvul6lz	cmmo2tx2f0006vku9spxzyl5d
cmmo2tx3q000tvku99fy770tw	cmmnqncdx0000fou9arvul6lz	cmmo2tx2g0007vku9qascautv
cmmo2tx3s000uvku98kjhblwm	cmmnqncdx0000fou9arvul6lz	cmmo2tx2i0008vku92sn4bp6r
cmmo2tx3u000vvku90v7r4q6w	cmmnqncdx0000fou9arvul6lz	cmmo2tx2k0009vku9vnzpacjs
cmmo2tx3v000wvku9s2w5dcky	cmmnqncdx0000fou9arvul6lz	cmmo2tx2m000avku9iu2yfsf9
cmmo2tx40000xvku9sagveznk	cmmnqncdx0000fou9arvul6lz	cmmo2tx2m000bvku9ftggpx7j
cmmo2tx42000yvku9ap82fi9r	cmmnqncdx0000fou9arvul6lz	cmmo2tx2n000cvku94lb3b2jd
cmmo2tx45000zvku9803hwnce	cmmnqncdx0000fou9arvul6lz	cmmo2tx2o000dvku92mink4de
cmmo2tx470010vku9azmraoi0	cmmnqncdx0000fou9arvul6lz	cmmo2tx2p000evku9783ppjmq
cmmo2tx480011vku9jrneaeo0	cmmnqncdx0000fou9arvul6lz	cmmo2tx2q000fvku9suhkb9z4
cmmo2tx4b0012vku9k7en632a	cmmnqncdx0000fou9arvul6lz	cmmo2tx2r000gvku9gc94lq0g
cmmo2tx4d0013vku9pjcou8hr	cmmnqncdx0000fou9arvul6lz	cmmo2tx2s000hvku91z4h0ovq
cmmo2tx4f0014vku9gukwnrx0	cmmnqncdx0000fou9arvul6lz	cmmo2tx2t000ivku9ig7kjpnr
cmmo2tx4h0015vku971n9gc8n	cmmnqncdx0000fou9arvul6lz	cmmo2tx2u000jvku9hipazijx
cmmo2tx4j0016vku9z0946bx9	cmmnqncdx0000fou9arvul6lz	cmmo2tx2v000kvku975e3ukby
cmmo2tx4l0017vku9ppf4bz1h	cmmnqncdx0000fou9arvul6lz	cmmo2tx2v000lvku9jtks8ozt
cmmo2tx4n0018vku9c2lc645h	cmmnqncdx0000fou9arvul6lz	cmmo2tx2w000mvku9plowyz9a
cmmo2tx4q0019vku9qsfoznua	cmmnqncdx0000fou9arvul6lz	cmmo2tx2x000nvku9wrm2exu0
cmmo2tx4s001avku9qsgeaozi	cmmnqncdx0000fou9arvul6lz	cmmo2tx2y000ovku9o9vhqsmf
cmmo2tx4u001bvku9dg17o0pm	cmmnqncdx0000fou9arvul6lz	cmmo2tx2z000pvku9099syha1
cmmq3n2ov0001ggu9w5ij9q61	cmmnqncff0001fou939j9j144	cmmo2tx2a0004vku9kyay71ng
cmmq3n2ov0002ggu9lgvico8m	cmmnqncff0001fou939j9j144	cmmo2tx2d0005vku9665oj9l6
cmmq3n2ov0003ggu9leqq9i9g	cmmnqncff0001fou939j9j144	cmmo2tx2f0006vku9spxzyl5d
cmmq3n2ov0004ggu9l8nb498p	cmmnqncff0001fou939j9j144	cmmo2tx2g0007vku9qascautv
cmmq3n2ov0005ggu97538iyhe	cmmnqncff0001fou939j9j144	cmmo2tx2i0008vku92sn4bp6r
cmmq3n2ov0006ggu91l3lz3lw	cmmnqncff0001fou939j9j144	cmmo2tx2k0009vku9vnzpacjs
cmmq3n2ov0007ggu9jolbxrvo	cmmnqncff0001fou939j9j144	cmmo2tx2m000avku9iu2yfsf9
cmmq3n2ov0008ggu9c8x100du	cmmnqncff0001fou939j9j144	cmmo2tx2m000bvku9ftggpx7j
cmmq3n2ov0009ggu9bm6b76ov	cmmnqncff0001fou939j9j144	cmmo2tx2n000cvku94lb3b2jd
cmmq3n2ov000aggu9vjrl78rp	cmmnqncff0001fou939j9j144	cmmo2tx2o000dvku92mink4de
cmmq3n2ov000bggu9beb59vuo	cmmnqncff0001fou939j9j144	cmmo2tx2p000evku9783ppjmq
cmmq3n2ov000cggu9sjfwscb7	cmmnqncff0001fou939j9j144	cmmo2tx2q000fvku9suhkb9z4
cmmq3n2ov000dggu9q1dwbedi	cmmnqncff0001fou939j9j144	cmmo2tx2r000gvku9gc94lq0g
cmmq3n2ov000eggu9ej2oyz2c	cmmnqncff0001fou939j9j144	cmmo2tx2s000hvku91z4h0ovq
cmmq3n2ov000fggu9e0gz0hei	cmmnqncff0001fou939j9j144	cmmo2tx2t000ivku9ig7kjpnr
cmmq3n2ov000gggu9ghx068y2	cmmnqncff0001fou939j9j144	cmmo2tx2u000jvku9hipazijx
cmmq3n2ov000hggu9ftkop7he	cmmnqncff0001fou939j9j144	cmmo2tx2v000kvku975e3ukby
cmmq3n2ov000iggu9rg5vkl96	cmmnqncff0001fou939j9j144	cmmo2tx2v000lvku9jtks8ozt
cmmq3n2ov000jggu9a2fd5ydf	cmmnqncff0001fou939j9j144	cmmo2tx2w000mvku9plowyz9a
cmmq3n2ov000kggu9qvu00w8o	cmmnqncff0001fou939j9j144	cmmo2tx2x000nvku9wrm2exu0
cmmq3n2ov000lggu9z9y8eqww	cmmnqncff0001fou939j9j144	cmmo2tx2y000ovku9o9vhqsmf
cmmq3n2ov000mggu9mbytczuf	cmmnqncff0001fou939j9j144	cmmo2tx2z000pvku9099syha1
cmmq7xcch0011ggu9pti75e2q	cmmnqncfi0002fou9rb7r0da0	cmmo2tx2a0004vku9kyay71ng
cmmq7xcch0012ggu994ub66a8	cmmnqncfi0002fou9rb7r0da0	cmmo2tx2d0005vku9665oj9l6
cmmq7xcch0013ggu96czucnmr	cmmnqncfi0002fou9rb7r0da0	cmmo2tx2f0006vku9spxzyl5d
cmmq7xcch0014ggu962207bqi	cmmnqncfi0002fou9rb7r0da0	cmmo2tx2g0007vku9qascautv
cmmq7xcch0015ggu9whalzxlp	cmmnqncfi0002fou9rb7r0da0	cmmo2tx2i0008vku92sn4bp6r
cmmq7xcch0016ggu9937e8ak9	cmmnqncfi0002fou9rb7r0da0	cmmo2tx2k0009vku9vnzpacjs
cmmq7xcch0017ggu9ky9xm48g	cmmnqncfi0002fou9rb7r0da0	cmmo2tx2m000avku9iu2yfsf9
cmmq7xcch0018ggu9se7jmdzo	cmmnqncfi0002fou9rb7r0da0	cmmo2tx2m000bvku9ftggpx7j
cmmq7xcch0019ggu97yl51973	cmmnqncfi0002fou9rb7r0da0	cmmo2tx2n000cvku94lb3b2jd
cmmq7xcch001aggu9mwvt20us	cmmnqncfi0002fou9rb7r0da0	cmmo2tx2o000dvku92mink4de
cmmq7xcch001bggu9jy9nbqc1	cmmnqncfi0002fou9rb7r0da0	cmmo2tx2p000evku9783ppjmq
cmmq7xcch001cggu9qim8ztm5	cmmnqncfi0002fou9rb7r0da0	cmmo2tx2q000fvku9suhkb9z4
cmmq7xcch001dggu9kdiweauh	cmmnqncfi0002fou9rb7r0da0	cmmo2tx2r000gvku9gc94lq0g
cmmq7xcch001eggu9mmgh0j57	cmmnqncfi0002fou9rb7r0da0	cmmo2tx2s000hvku91z4h0ovq
cmmq7xcch001fggu915y17fvk	cmmnqncfi0002fou9rb7r0da0	cmmo2tx2t000ivku9ig7kjpnr
cmmq7xcch001gggu91est9kcu	cmmnqncfi0002fou9rb7r0da0	cmmo2tx2u000jvku9hipazijx
cmmq7xcch001hggu9jjopkmnw	cmmnqncfi0002fou9rb7r0da0	cmmo2tx2v000kvku975e3ukby
cmmq7xcch001iggu9t308xmbt	cmmnqncfi0002fou9rb7r0da0	cmmo2tx2v000lvku9jtks8ozt
cmmq7xcch001jggu9h0e88v9u	cmmnqncfi0002fou9rb7r0da0	cmmo2tx2w000mvku9plowyz9a
cmmq7xcch001kggu9itr9j6yy	cmmnqncfi0002fou9rb7r0da0	cmmo2tx2x000nvku9wrm2exu0
cmmq7xcch001lggu97lvx92zu	cmmnqncfi0002fou9rb7r0da0	cmmo2tx2y000ovku9o9vhqsmf
cmmq7xcch001mggu9moq37pz7	cmmnqncfi0002fou9rb7r0da0	cmmo2tx2z000pvku9099syha1
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, name, code, description, "createdAt", "updatedAt") FROM stdin;
cmmnqncdx0000fou9arvul6lz	System Admin	SYSTEM_ADMIN	Full system access	2026-03-12 17:25:02.709	2026-03-13 12:01:35.997
cmmnqncff0001fou939j9j144	Agent	AGENT	Agent access	2026-03-12 17:25:02.763	2026-03-13 12:01:36.08
cmmnqncfi0002fou9rb7r0da0	Driver	DRIVER	Driver access	2026-03-12 17:25:02.766	2026-03-13 12:01:36.083
cmmnqncfk0003fou95vq1kz43	Shop Client	SHOP	Shop portal access	2026-03-12 17:25:02.767	2026-03-13 12:01:36.085
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.settings (id, "companyName", "companyLogo", slogan, address, "contactNumber", "brNumber", email, website, currency, language, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: shops; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shops (id, code, "shopName", "ownerName", phone, email, address, website, "logoUrl", "regionId", "cityId", "assignedAgentId", "assignedDriverId", status, "notifySms", "notifyEmail", "createdAt", "updatedAt") FROM stdin;
cmmnxnwbl0000bsu91387ugwm	SU	WEBLAB	Ushan Malinth Perera	0755605979	malinthaushan444@gmail.com	126/2E, Arawwala Road,	https://weblabsolutions.co.uk/	\N	cmmqk0i1v00f0rou95p168jt2	cmmqk1nh300farou9btkjplmv	\N	\N	PENDING	t	t	2026-03-12 20:41:25.856	2026-03-14 16:43:31.486
\.


--
-- Data for Name: stock_allocations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_allocations (id, "agentId", "productId", "allocatedQty", "usedQty", "remainingQty", "allocationDate", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: town_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.town_assignments (id, "townId", "agentId", "driverId", "createdAt", "updatedAt") FROM stdin;
cmmqrtsu70001yku9q9s10oec	cmmqk5t4w00jwrou9etxm20z3	cmmqrasal00ogrou9fmkd7f2x	cmmqrasay00ohrou9lpf5xxs3	2026-03-14 20:21:22.111	2026-03-14 20:21:22.111
cmmqrttfv0002yku9dgf7r8fn	cmmqk5t4d00jtrou9ypr2tfsy	cmmqrasal00ogrou9fmkd7f2x	cmmqrasay00ohrou9lpf5xxs3	2026-03-14 20:21:22.891	2026-03-14 20:21:25.301
cmmqrttv10003yku9m1mzxbhh	cmmqk5t4j00jurou9frb5dfhz	cmmqrasal00ogrou9fmkd7f2x	cmmqrasay00ohrou9lpf5xxs3	2026-03-14 20:21:23.437	2026-03-14 20:21:25.677
cmmqrslfe0000yku95qsukskc	cmmqk5t4q00jvrou91v9mxr3l	cmmqrasal00ogrou9fmkd7f2x	cmmqrasay00ohrou9lpf5xxs3	2026-03-14 20:20:25.85	2026-03-14 20:21:25.976
cmmqruxrp0008yku9x69id1z8	cmmqk5t5o00k0rou9trvcauq2	cmmqruxrh0007yku9ka8ztffb	cmmqrasay00ohrou9lpf5xxs3	2026-03-14 20:22:15.157	2026-03-14 20:22:15.157
cmmqruyf30009yku9mbb1f452	cmmqk5t5800jyrou90dia7wn4	cmmqruxrh0007yku9ka8ztffb	cmmqrasay00ohrou9lpf5xxs3	2026-03-14 20:22:15.999	2026-03-14 20:22:15.999
cmmqruyqw000ayku9y1ikqq5a	cmmqk5t5f00jzrou9wkpl4qiz	cmmqruxrh0007yku9ka8ztffb	cmmqrasay00ohrou9lpf5xxs3	2026-03-14 20:22:16.424	2026-03-14 20:22:16.424
cmmqruyz1000byku9fuuty6ku	cmmqk5t5200jxrou924ag3101	cmmqruxrh0007yku9ka8ztffb	cmmqrasay00ohrou9lpf5xxs3	2026-03-14 20:22:16.717	2026-03-14 20:22:16.717
cmmqth43q000gyku9j4ks4m40	cmmqk5tpf00ncrou91ygio2ch	cmmqtbe75000cyku9ys9xuaxi	cmmqrasay00ohrou9lpf5xxs3	2026-03-14 21:07:29.414	2026-03-14 21:07:29.414
cmmqtt5bh000iyku9tikepo4e	cmmqk5tr000nmrou91qz1ga63	cmmqtt5ba000hyku92k5gth3t	cmmqtbe7h000dyku9qhd2hobg	2026-03-14 21:16:50.861	2026-03-14 21:16:50.861
cmmquui5t000qyku905i90ryq	cmmqutc6l000myku97ifmeca4	cmmquui5l000pyku9jf39cxys	cmmqrasay00ohrou9lpf5xxs3	2026-03-14 21:45:53.777	2026-03-14 21:45:53.777
cmmquvqcg000tyku9e9wwqdqi	cmmqk5t9t00kgrou9vp8hf34d	cmmquvqc5000ryku92ocw2hv8	cmmquvqce000syku9941fa5hh	2026-03-14 21:46:51.04	2026-03-14 21:46:51.04
cmmquvqp8000uyku9kdij5be3	cmmqk5tad00kjrou93b7cms7i	cmmquvqc5000ryku92ocw2hv8	cmmquvqce000syku9941fa5hh	2026-03-14 21:46:51.5	2026-03-14 21:46:51.5
cmmquvqyj000vyku9hphqijve	cmmqk5ta700kirou9w0uefj5b	cmmquvqc5000ryku92ocw2hv8	cmmquvqce000syku9941fa5hh	2026-03-14 21:46:51.835	2026-03-14 21:46:51.835
cmmquvr74000wyku99kn7w8cw	cmmqk5t9z00khrou9fwmn27n1	cmmquvqc5000ryku92ocw2hv8	cmmquvqce000syku9941fa5hh	2026-03-14 21:46:52.144	2026-03-14 21:46:52.144
cmmquwa3f000yyku950g3qen9	cmmqk5t7p00k9rou9pmky5k05	cmmquwa39000xyku9k19lvsnd	cmmquvqce000syku9941fa5hh	2026-03-14 21:47:16.635	2026-03-14 21:47:16.635
cmmquy1f40011yku9kc64ftd8	cmmquxpna000zyku9nrh0e0r5	cmmquy1ey0010yku9ef92kd72	cmmqrasay00ohrou9lpf5xxs3	2026-03-14 21:48:38.704	2026-03-14 21:48:38.704
cmmquz95v0013yku973e8kgv6	cmmquyt6h0012yku9ugl15zya	cmmqrbhm500onrou94gt4w91e	cmmqrasay00ohrou9lpf5xxs3	2026-03-14 21:49:35.395	2026-03-14 21:49:35.395
cmmqv0f0g0015yku977vl8dd8	cmmqk5to900n4rou9esfzn7i7	cmmqv0f090014yku9rhhocql6	cmmqtbe7h000dyku9qhd2hobg	2026-03-14 21:50:29.632	2026-03-14 21:50:29.632
cmmqv0f9u0016yku9xw8xxtbk	cmmqk5to200n3rou9knwmxkzo	cmmqv0f090014yku9rhhocql6	cmmqtbe7h000dyku9qhd2hobg	2026-03-14 21:50:29.97	2026-03-14 21:50:29.97
cmmqv0fn40017yku96yrbfukx	cmmqk5tns00n1rou93o76vzgm	cmmqv0f090014yku9rhhocql6	cmmqtbe7h000dyku9qhd2hobg	2026-03-14 21:50:30.448	2026-03-14 21:50:30.448
cmmqv0fyd0018yku9cw245zlo	cmmqk5tnx00n2rou94daw260s	cmmqv0f090014yku9rhhocql6	cmmqtbe7h000dyku9qhd2hobg	2026-03-14 21:50:30.853	2026-03-14 21:50:30.853
cmmqv0v6y001ayku942tizus9	cmmqk5tp000n9rou91c00psqk	cmmqv0v6s0019yku99h272xw7	cmmqrasay00ohrou9lpf5xxs3	2026-03-14 21:50:50.602	2026-03-14 21:50:50.602
cmmqttmme000kyku9hmmyopk8	cmmqk5tov00n8rou94v5ntrfc	cmmqruxrh0007yku9ka8ztffb	cmmqrasay00ohrou9lpf5xxs3	2026-03-14 21:17:13.286	2026-03-14 21:54:27.398
cmmqv5tdq001dyku9pmhxi12r	cmmqk5t7w00karou9kelakwtf	cmmqv5tdk001cyku95704wqxh	cmmqtbe7h000dyku9qhd2hobg	2026-03-14 21:54:41.534	2026-03-14 21:54:41.534
\.


--
-- Data for Name: towns; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.towns (id, name, code, status, "cityId", "createdAt", "updatedAt") FROM stdin;
cmmqk5sx900inrou9ub01h7vw	Bambalapitiya	TWN_1773506805165_uu1p1ia5	t	cmmqk5omw00i2rou950uacy3s	2026-03-14 16:46:45.165	2026-03-14 16:46:45.165
cmmqk5sxr00iorou92hi39kut	Borella	TWN_1773506805182_jqa09crp	t	cmmqk5omw00i2rou950uacy3s	2026-03-14 16:46:45.183	2026-03-14 16:46:45.183
cmmqk5sxx00iprou9ddrwgpc6	Fort	TWN_1773506805188_p9e329by	t	cmmqk5omw00i2rou950uacy3s	2026-03-14 16:46:45.189	2026-03-14 16:46:45.189
cmmqk5sy500iqrou9eh9mn651	Grandpass	TWN_1773506805196_69d0f666	t	cmmqk5omw00i2rou950uacy3s	2026-03-14 16:46:45.196	2026-03-14 16:46:45.196
cmmqk5sya00irrou979qrwq87	Kollupitiya	TWN_1773506805201_85jvoupd	t	cmmqk5omw00i2rou950uacy3s	2026-03-14 16:46:45.201	2026-03-14 16:46:45.201
cmmqk5syf00isrou9712cwobr	Maradana	TWN_1773506805207_fcf1tsck	t	cmmqk5omw00i2rou950uacy3s	2026-03-14 16:46:45.207	2026-03-14 16:46:45.207
cmmqk5sym00itrou96ab31nz5	Pettah	TWN_1773506805212_89iof5e2	t	cmmqk5omw00i2rou950uacy3s	2026-03-14 16:46:45.213	2026-03-14 16:46:45.213
cmmqk5sys00iurou9g933bc8k	Wellawatte	TWN_1773506805220_g32yizey	t	cmmqk5omw00i2rou950uacy3s	2026-03-14 16:46:45.22	2026-03-14 16:46:45.22
cmmqk5syy00ivrou93ljuo5nd	Slave Island	TWN_1773506805226_dsoovch9	t	cmmqk5omw00i2rou950uacy3s	2026-03-14 16:46:45.226	2026-03-14 16:46:45.226
cmmqk5sz300iwrou941hi2jym	Dematagoda	TWN_1773506805230_wklevr8t	t	cmmqk5omw00i2rou950uacy3s	2026-03-14 16:46:45.231	2026-03-14 16:46:45.231
cmmqk5sz800ixrou9kbxaupns	Rajagiriya	TWN_1773506805236_pe2s2t3v	t	cmmqk5opk00ikrou92l38x5sj	2026-03-14 16:46:45.236	2026-03-14 16:46:45.236
cmmqk5szd00iyrou9sjxfogwt	Nawala	TWN_1773506805240_c1yir5v2	t	cmmqk5opk00ikrou92l38x5sj	2026-03-14 16:46:45.241	2026-03-14 16:46:45.241
cmmqk5szh00izrou9ti87h9l3	Ethul Kotte	TWN_1773506805245_p2g2welf	t	cmmqk5opk00ikrou92l38x5sj	2026-03-14 16:46:45.245	2026-03-14 16:46:45.245
cmmqk5szm00j0rou90qdogonj	Pitakotte	TWN_1773506805250_snos4ggv	t	cmmqk5opk00ikrou92l38x5sj	2026-03-14 16:46:45.25	2026-03-14 16:46:45.25
cmmqk5szr00j1rou97o17cv7d	Koswatta	TWN_1773506805255_ez8a86x1	t	cmmqk5opk00ikrou92l38x5sj	2026-03-14 16:46:45.255	2026-03-14 16:46:45.255
cmmqk5szw00j2rou9zbjaftci	Battaramulla	TWN_1773506805260_gbvr56si	t	cmmqk5opk00ikrou92l38x5sj	2026-03-14 16:46:45.26	2026-03-14 16:46:45.26
cmmqk5t0200j3rou93c8hti49	Pannipitiya	TWN_1773506805265_h98auxsg	t	cmmqk5oow00ifrou9cluo4tvc	2026-03-14 16:46:45.265	2026-03-14 16:46:45.265
cmmqk5t0700j4rou94vm6ubyt	Kottawa	TWN_1773506805270_v2oh86ls	t	cmmqk5oow00ifrou9cluo4tvc	2026-03-14 16:46:45.271	2026-03-14 16:46:45.271
cmmqk5t0d00j5rou9z83ualhl	Pamunuwa	TWN_1773506805276_v0upro2m	t	cmmqk5oow00ifrou9cluo4tvc	2026-03-14 16:46:45.276	2026-03-14 16:46:45.276
cmmqk5t0i00j6rou9ur5vpu9l	Navinna	TWN_1773506805282_xvc8zumo	t	cmmqk5oow00ifrou9cluo4tvc	2026-03-14 16:46:45.282	2026-03-14 16:46:45.282
cmmqk5t0n00j7rou9fii68u32	Wijerama	TWN_1773506805287_62kjquyn	t	cmmqk5oow00ifrou9cluo4tvc	2026-03-14 16:46:45.287	2026-03-14 16:46:45.287
cmmqk5t0s00j8rou90abmicrb	Wattegedara	TWN_1773506805292_51sstyug	t	cmmqk5oow00ifrou9cluo4tvc	2026-03-14 16:46:45.292	2026-03-14 16:46:45.292
cmmqk5t0x00j9rou971i9t7bl	Katubedda	TWN_1773506805297_wgor6ma5	t	cmmqk5op600ihrou9txq6539k	2026-03-14 16:46:45.297	2026-03-14 16:46:45.297
cmmqk5t1300jarou99op2gxn4	Rawathawatta	TWN_1773506805302_pgp8mhqp	t	cmmqk5op600ihrou9txq6539k	2026-03-14 16:46:45.303	2026-03-14 16:46:45.303
cmmqk5t1800jbrou9zedl4jn7	Lunawa	TWN_1773506805308_2rd3oh8a	t	cmmqk5op600ihrou9txq6539k	2026-03-14 16:46:45.308	2026-03-14 16:46:45.308
cmmqk5t1f00jcrou99841mypy	Angulana	TWN_1773506805314_8ns9iwq3	t	cmmqk5op600ihrou9txq6539k	2026-03-14 16:46:45.314	2026-03-14 16:46:45.314
cmmqk5t1k00jdrou91h7fubc9	Koralawella	TWN_1773506805320_kap05zqn	t	cmmqk5op600ihrou9txq6539k	2026-03-14 16:46:45.32	2026-03-14 16:46:45.32
cmmqk5t1q00jerou9nb6td2o2	Egoda Uyana	TWN_1773506805326_brtf2vk8	t	cmmqk5op600ihrou9txq6539k	2026-03-14 16:46:45.326	2026-03-14 16:46:45.326
cmmqk5t1w00jfrou9r90jaay4	Piliyandala	TWN_1773506805332_pra4p05b	t	cmmqk5oom00idrou9pdxobzep	2026-03-14 16:46:45.332	2026-03-14 16:46:45.332
cmmqk5t2200jgrou95g6fet7q	Madapatha	TWN_1773506805338_lt72cx8q	t	cmmqk5oom00idrou9pdxobzep	2026-03-14 16:46:45.338	2026-03-14 16:46:45.338
cmmqk5t2b00jhrou9l44z998i	Bokundara	TWN_1773506805346_t9uvktqs	t	cmmqk5oom00idrou9pdxobzep	2026-03-14 16:46:45.346	2026-03-14 16:46:45.346
cmmqk5t2h00jirou967lo11pm	Kahathuduwa	TWN_1773506805353_4fbatw4x	t	cmmqk5oom00idrou9pdxobzep	2026-03-14 16:46:45.353	2026-03-14 16:46:45.353
cmmqk5t2o00jjrou9uvf89cwj	Dampe	TWN_1773506805359_w8rlaayi	t	cmmqk5oom00idrou9pdxobzep	2026-03-14 16:46:45.36	2026-03-14 16:46:45.36
cmmqk5t2t00jkrou9u8dqq3oh	Homagama Town	TWN_1773506805365_sa7ht14u	t	cmmqk5oni00i6rou967q9kvaf	2026-03-14 16:46:45.365	2026-03-14 16:46:45.365
cmmqk5t2z00jlrou93f04vk8z	Godagama	TWN_1773506805371_wsotco9f	t	cmmqk5oni00i6rou967q9kvaf	2026-03-14 16:46:45.371	2026-03-14 16:46:45.371
cmmqk5t3500jmrou9826ny23t	Diyagama	TWN_1773506805377_5trcrx0i	t	cmmqk5oni00i6rou967q9kvaf	2026-03-14 16:46:45.377	2026-03-14 16:46:45.377
cmmqk5t3b00jnrou9ew6y1rqk	Pitipana	TWN_1773506805383_9lm8ie9q	t	cmmqk5oni00i6rou967q9kvaf	2026-03-14 16:46:45.383	2026-03-14 16:46:45.383
cmmqk5t3h00jorou9t6ulx2qu	Meegoda	TWN_1773506805389_f71unbsa	t	cmmqk5oni00i6rou967q9kvaf	2026-03-14 16:46:45.389	2026-03-14 16:46:45.389
cmmqk5t3o00jprou9jb19zcqu	Yakkala	TWN_1773506805396_zrad1aw7	t	cmmqk5on700i4rou93qasabha	2026-03-14 16:46:45.396	2026-03-14 16:46:45.396
cmmqk5t3u00jqrou9ncrifrft	Miriswatta	TWN_1773506805402_3f15it9c	t	cmmqk5on700i4rou93qasabha	2026-03-14 16:46:45.402	2026-03-14 16:46:45.402
cmmqk5t4100jrrou9no2lysbq	Udugampola	TWN_1773506805409_dilcepz3	t	cmmqk5on700i4rou93qasabha	2026-03-14 16:46:45.409	2026-03-14 16:46:45.409
cmmqk5t4700jsrou9fl0z3p0u	Makevita	TWN_1773506805415_6w7li420	t	cmmqk5on700i4rou93qasabha	2026-03-14 16:46:45.415	2026-03-14 16:46:45.415
cmmqk5t4d00jtrou9ypr2tfsy	Kochchikade	TWN_1773506805421_wfvvug7u	t	cmmqk5opb00iirou9n826w15p	2026-03-14 16:46:45.421	2026-03-14 16:46:45.421
cmmqk5t4j00jurou9frb5dfhz	Kattuwa	TWN_1773506805427_u9nskr0f	t	cmmqk5opb00iirou9n826w15p	2026-03-14 16:46:45.427	2026-03-14 16:46:45.427
cmmqk5t4q00jvrou91v9mxr3l	Dalupotha	TWN_1773506805433_iusm59ip	t	cmmqk5opb00iirou9n826w15p	2026-03-14 16:46:45.434	2026-03-14 16:46:45.434
cmmqk5t4w00jwrou9etxm20z3	Periyamulla	TWN_1773506805440_4f0vmksw	t	cmmqk5opb00iirou9n826w15p	2026-03-14 16:46:45.44	2026-03-14 16:46:45.44
cmmqk5t5200jxrou924ag3101	Hendala	TWN_1773506805445_u44780hc	t	cmmqk5opu00imrou9wqcsgmx3	2026-03-14 16:46:45.445	2026-03-14 16:46:45.445
cmmqk5t5800jyrou90dia7wn4	Mabole	TWN_1773506805451_cwb456ug	t	cmmqk5opu00imrou9wqcsgmx3	2026-03-14 16:46:45.451	2026-03-14 16:46:45.451
cmmqk5t5f00jzrou9wkpl4qiz	Hunupitiya	TWN_1773506805458_gtna5g3q	t	cmmqk5opu00imrou9wqcsgmx3	2026-03-14 16:46:45.458	2026-03-14 16:46:45.458
cmmqk5t5o00k0rou9trvcauq2	Uswetakeiyawa	TWN_1773506805466_an94x942	t	cmmqk5opu00imrou9wqcsgmx3	2026-03-14 16:46:45.466	2026-03-14 16:46:45.466
cmmqk5t5w00k1rou92cu4rpdq	Seeduwa	TWN_1773506805475_tabt7ayg	t	cmmqk5ooa00ibrou97ku6qlw5	2026-03-14 16:46:45.475	2026-03-14 16:46:45.475
cmmqk5t6700k2rou9v9la5o43	Andiambalama	TWN_1773506805486_gcwaj7p7	t	cmmqk5ooa00ibrou97ku6qlw5	2026-03-14 16:46:45.487	2026-03-14 16:46:45.487
cmmqk5t6d00k3rou9ddvot8b2	Amandoluwa	TWN_1773506805492_6d0eiuei	t	cmmqk5ooa00ibrou97ku6qlw5	2026-03-14 16:46:45.492	2026-03-14 16:46:45.492
cmmqk5t6j00k4rou9qaoc2tgp	Yatiyana	TWN_1773506805498_wkrorh1n	t	cmmqk5op100igrou9ynk7sqd6	2026-03-14 16:46:45.498	2026-03-14 16:46:45.498
cmmqk5t6o00k5rou90muv50ov	Peliyagoda	TWN_1773506805504_zzc1agc6	t	cmmqk5oog00icrou99odxyvfd	2026-03-14 16:46:45.504	2026-03-14 16:46:45.504
cmmqk5t6u00k6rou9z4bl4be7	Kiribathgoda	TWN_1773506805510_2n4i37kq	t	cmmqk5oog00icrou99odxyvfd	2026-03-14 16:46:45.51	2026-03-14 16:46:45.51
cmmqk5t7100k7rou9200zzk2x	Dalugama	TWN_1773506805516_cvfhctkw	t	cmmqk5oog00icrou99odxyvfd	2026-03-14 16:46:45.517	2026-03-14 16:46:45.517
cmmqk5t7700k8rou93h99on5x	Pattiya	TWN_1773506805522_3kom31p7	t	cmmqk5oog00icrou99odxyvfd	2026-03-14 16:46:45.522	2026-03-14 16:46:45.522
cmmqk5t7p00k9rou9pmky5k05	Kadawatha	TWN_1773506805541_dm9mltgq	t	cmmqk5on700i4rou93qasabha	2026-03-14 16:46:45.541	2026-03-14 16:46:45.541
cmmqk5t7w00karou9kelakwtf	Nittambuwa	TWN_1773506805548_tmaz3ma1	t	cmmqk5on700i4rou93qasabha	2026-03-14 16:46:45.548	2026-03-14 16:46:45.548
cmmqk5t8p00kcrou97narg0vy	Divulapitiya	TWN_1773506805576_3w6dtux0	t	cmmqk5op100igrou9ynk7sqd6	2026-03-14 16:46:45.576	2026-03-14 16:46:45.576
cmmqk5t9100kerou9tfuk4t5k	Nagoda	TWN_1773506805589_pbdvk9an	t	cmmqk5oo400iarou98mevk1mx	2026-03-14 16:46:45.589	2026-03-14 16:46:45.589
cmmqk5t9t00kgrou9vp8hf34d	Walana	TWN_1773506805617_2gwkce62	t	cmmqk5opg00ijrou9taqyw9f5	2026-03-14 16:46:45.617	2026-03-14 16:46:45.617
cmmqk5tad00kjrou93b7cms7i	Pinwatta	TWN_1773506805637_oxa4tv0g	t	cmmqk5opg00ijrou9taqyw9f5	2026-03-14 16:46:45.637	2026-03-14 16:46:45.637
cmmqk5tap00klrou9cry8dj3m	Poruwadanda	TWN_1773506805649_gdgsm0dc	t	cmmqk5onn00i7rou9uflf9m45	2026-03-14 16:46:45.649	2026-03-14 16:46:45.649
cmmqk5tav00kmrou9pn5zhl84	Pokunuwita	TWN_1773506805655_q748vs4o	t	cmmqk5onn00i7rou9uflf9m45	2026-03-14 16:46:45.655	2026-03-14 16:46:45.655
cmmqk5tb700korou91hvlxbfq	Aluthgama	TWN_1773506805666_01stbfcz	t	cmmqk5omq00i1rou9n8e971lg	2026-03-14 16:46:45.667	2026-03-14 16:46:45.667
cmmqk5tbc00kprou9xzk370vh	Maggona	TWN_1773506805672_278sezda	t	cmmqk5omq00i1rou9n8e971lg	2026-03-14 16:46:45.672	2026-03-14 16:46:45.672
cmmqk5tbo00krrou9xziifr8g	Waskaduwa	TWN_1773506805684_5atte1xo	t	cmmqk5opp00ilrou9hpa8apq9	2026-03-14 16:46:45.684	2026-03-14 16:46:45.684
cmmqk5tby00ktrou9w01ljflj	Eduragala	TWN_1773506805694_awtzngba	t	cmmqk5ons00i8rou91fzlyrzl	2026-03-14 16:46:45.694	2026-03-14 16:46:45.694
cmmqk5tc900kvrou93c6o0yzl	Agalawatta	TWN_1773506805705_zzyinjfl	t	cmmqk5oo400iarou98mevk1mx	2026-03-14 16:46:45.705	2026-03-14 16:46:45.705
cmmqk5tcj00kxrou998bcfvyf	Katugastota	TWN_1773506805715_3p6zwi1b	t	cmmqk5obu00g6rou9c1mxp6s0	2026-03-14 16:46:45.715	2026-03-14 16:46:45.715
cmmqk5tcs00kzrou9vy01z5e8	Kundasale	TWN_1773506805724_h9oe77h2	t	cmmqk5obu00g6rou9c1mxp6s0	2026-03-14 16:46:45.724	2026-03-14 16:46:45.724
cmmqk5td300l1rou962honylp	Madawala	TWN_1773506805734_zrjwdzlh	t	cmmqk5obu00g6rou9c1mxp6s0	2026-03-14 16:46:45.735	2026-03-14 16:46:45.735
cmmqk5tdf00l3rou9n7k3jt2q	Gelioya	TWN_1773506805747_nvbzt2xv	t	cmmqk5obe00g3rou9p5vjhhaw	2026-03-14 16:46:45.747	2026-03-14 16:46:45.747
cmmqk5tdq00l5rou9vcs7cn57	Doluwa	TWN_1773506805758_5t5764kq	t	cmmqk5obe00g3rou9p5vjhhaw	2026-03-14 16:46:45.758	2026-03-14 16:46:45.758
cmmqk5tdz00l7rou9l0z1mk7z	Watawala	TWN_1773506805767_ur5oprvv	t	cmmqk5ocd00g9rou9p5egw0ah	2026-03-14 16:46:45.767	2026-03-14 16:46:45.767
cmmqk5te900l9rou9ohrwd5pb	Balana	TWN_1773506805777_rydm5zkc	t	cmmqk5obo00g5rou965hjttt2	2026-03-14 16:46:45.777	2026-03-14 16:46:45.777
cmmqk5tei00lbrou929zv24mv	Rattota	TWN_1773506805786_j3cubnjd	t	cmmqk5oc100g7rou9yfr283x6	2026-03-14 16:46:45.786	2026-03-14 16:46:45.786
cmmqk5tet00ldrou9oqu0j8pz	Pallepola	TWN_1773506805797_kp0nypr7	t	cmmqk5oc100g7rou9yfr283x6	2026-03-14 16:46:45.797	2026-03-14 16:46:45.797
cmmqk5tf400lfrou9uhqckdo2	Sigiriya	TWN_1773506805808_d4gouzer	t	cmmqk5ob500g1rou92fprvf39	2026-03-14 16:46:45.808	2026-03-14 16:46:45.808
cmmqk5tfe00lhrou94nxsyitt	Hawa Eliya	TWN_1773506805818_ufmpf0y9	t	cmmqk5oci00garou99s3pnf3w	2026-03-14 16:46:45.818	2026-03-14 16:46:45.818
cmmqk5tfp00ljrou9hs92y94r	Nanu Oya	TWN_1773506805829_oxk3i3kz	t	cmmqk5oci00garou99s3pnf3w	2026-03-14 16:46:45.829	2026-03-14 16:46:45.829
cmmqk5tfz00llrou9gbbago5l	Dickoya	TWN_1773506805838_3rl9zrzg	t	cmmqk5obj00g4rou9ck3e1by4	2026-03-14 16:46:45.839	2026-03-14 16:46:45.839
cmmqk5tg900lnrou9e4wab5a9	Watagoda	TWN_1773506805848_oz8wbldz	t	cmmqk5ocr00gcrou98nybmdoy	2026-03-14 16:46:45.848	2026-03-14 16:46:45.848
cmmqk5tgj00lprou90dqazhoq	Thiranagama	TWN_1773506805858_cqswpwc4	t	cmmqk5okd00horou95u1yk1ct	2026-03-14 16:46:45.858	2026-03-14 16:46:45.858
cmmqk5tgu00lrrou9384h2y6r	Pathegama	TWN_1773506805870_lxrby7s0	t	cmmqk5ojm00hjrou9trsct3ns	2026-03-14 16:46:45.87	2026-03-14 16:46:45.87
cmmqk5th500ltrou9d00pwnkz	Walgama	TWN_1773506805881_xf2iygqa	t	cmmqk5oko00hqrou9d99bg0r7	2026-03-14 16:46:45.881	2026-03-14 16:46:45.881
cmmqk5thg00lvrou99is2qojj	Kamburupitiya	TWN_1773506805892_bkuqpdal	t	cmmqk5oko00hqrou9d99bg0r7	2026-03-14 16:46:45.892	2026-03-14 16:46:45.892
cmmqk5thr00lxrou9vyowtama	Midigama	TWN_1773506805903_ouqbnpq9	t	cmmqk5ol500htrou9l14ka689	2026-03-14 16:46:45.903	2026-03-14 16:46:45.903
cmmqk5ti200lzrou933euk79z	Dikwella	TWN_1773506805913_tfsiw5s0	t	cmmqk5oko00hqrou9d99bg0r7	2026-03-14 16:46:45.914	2026-03-14 16:46:45.914
cmmqk5tic00m1rou9nghe8xm7	Sooriyawewa	TWN_1773506805924_5biedho1	t	cmmqk5ok800hnrou9bvr65r64	2026-03-14 16:46:45.924	2026-03-14 16:46:45.924
cmmqk5tin00m3rou9p26ebbmf	Beliatta	TWN_1773506805935_nnnrua0k	t	cmmqk5okt00hrrou95ub1mz7v	2026-03-14 16:46:45.935	2026-03-14 16:46:45.935
cmmqk5tiu00m4rou93bjkuq3r	Netolpitiya	TWN_1773506805942_ng9fxolw	t	cmmqk5okt00hrrou95ub1mz7v	2026-03-14 16:46:45.942	2026-03-14 16:46:45.942
cmmqk5tj600m6rou9n0gr6ayv	Kataragama	TWN_1773506805953_pf5fuyqa	t	cmmqk5ok800hnrou9bvr65r64	2026-03-14 16:46:45.953	2026-03-14 16:46:45.953
cmmqk5tjg00m8rou9gb2x8uf8	Manipay	TWN_1773506805964_wt8n66z2	t	cmmqk5ogd00h0rou992rp8o79	2026-03-14 16:46:45.964	2026-03-14 16:46:45.964
cmmqk5tjr00marou91gwjt564	Chavakachcheri	TWN_1773506805974_ssifq2ou	t	cmmqk5ogd00h0rou992rp8o79	2026-03-14 16:46:45.974	2026-03-14 16:46:45.974
cmmqk5tk100mcrou9qjgoixcw	Valvettithurai	TWN_1773506805984_vdun83qf	t	cmmqk5ogd00h0rou992rp8o79	2026-03-14 16:46:45.984	2026-03-14 16:46:45.984
cmmqk5tkc00merou9ieucont6	Poonakary	TWN_1773506805996_rigw8too	t	cmmqk5ogj00h1rou9re4y8vz3	2026-03-14 16:46:45.996	2026-03-14 16:46:45.996
cmmqk5tkm00mgrou9whqtbcme	Pesalai	TWN_1773506806006_5ji70qua	t	cmmqk5ogo00h2rou9v7ad2jf7	2026-03-14 16:46:46.006	2026-03-14 16:46:46.006
cmmqk5tky00mirou9r3ifzkx7	Talaimannar	TWN_1773506806017_pjtyva51	t	cmmqk5ogo00h2rou9v7ad2jf7	2026-03-14 16:46:46.017	2026-03-14 16:46:46.017
cmmqk5tl800mkrou94y556iyu	Oddusuddan	TWN_1773506806028_x5efz0tq	t	cmmqk5ogv00h3rou9pb3roq3z	2026-03-14 16:46:46.028	2026-03-14 16:46:46.028
cmmqk5tlk00mmrou9d4shs2rv	Omanthai	TWN_1773506806039_grn9lzlc	t	cmmqk5ohy00harou9y1qhbwxm	2026-03-14 16:46:46.039	2026-03-14 16:46:46.039
cmmqk5tlt00morou91ldwnj02	Nedunkeni	TWN_1773506806049_62mgtdl2	t	cmmqk5ohy00harou9y1qhbwxm	2026-03-14 16:46:46.049	2026-03-14 16:46:46.049
cmmqk5tm400mqrou9a4p6icuy	Nilaveli	TWN_1773506806060_a6ayc3f7	t	cmmqk5oe600gmrou9bzei363x	2026-03-14 16:46:46.06	2026-03-14 16:46:46.06
cmmqk5tmg00msrou9vc0s75kx	Kuchchaveli	TWN_1773506806071_sz7gslby	t	cmmqk5oe600gmrou9bzei363x	2026-03-14 16:46:46.072	2026-03-14 16:46:46.072
cmmqk5tmr00murou9pedrmbkk	Kattankudy	TWN_1773506806083_xnw4nujv	t	cmmqk5od700gfrou9wmtwq6np	2026-03-14 16:46:46.083	2026-03-14 16:46:46.083
cmmqk5tn100mwrou93wa1lmet	Chenkaladi	TWN_1773506806093_8n64biq7	t	cmmqk5od700gfrou9wmtwq6np	2026-03-14 16:46:46.093	2026-03-14 16:46:46.093
cmmqk5tnc00myrou9tlm55rfc	Akkaraipattu	TWN_1773506806103_8gxz2hii	t	cmmqk5od200gerou9lwr0rkvv	2026-03-14 16:46:46.103	2026-03-14 16:46:46.103
cmmqk5tnm00n0rou9gnn8dsv0	Pottuvil	TWN_1773506806114_o7j02dp8	t	cmmqk5od200gerou9lwr0rkvv	2026-03-14 16:46:46.114	2026-03-14 16:46:46.114
cmmqk5tnx00n2rou94daw260s	Nochchiyagama	TWN_1773506806125_8nt1j3ps	t	cmmqk5oeb00gnrou9nosuntu4	2026-03-14 16:46:46.125	2026-03-14 16:46:46.125
cmmqk5to900n4rou9esfzn7i7	Kekirawa	TWN_1773506806137_zksmobg6	t	cmmqk5oeb00gnrou9nosuntu4	2026-03-14 16:46:46.137	2026-03-14 16:46:46.137
cmmqk5tok00n6rou9sh9bqp6r	Medirigiriya	TWN_1773506806147_51jsmx3r	t	cmmqk5oew00grrou9mhisc2vr	2026-03-14 16:46:46.148	2026-03-14 16:46:46.148
cmmqk5tov00n8rou94v5ntrfc	Kuliyapitiya	TWN_1773506806158_0e2sqe9s	t	cmmqk5ofe00gurou9id0exr3g	2026-03-14 16:46:46.159	2026-03-14 16:46:46.159
cmmqk5tp500narou9jryjs26j	Polgahawela	TWN_1773506806169_ssz1297y	t	cmmqk5ofe00gurou9id0exr3g	2026-03-14 16:46:46.169	2026-03-14 16:46:46.169
cmmqk5tpf00ncrou91ygio2ch	Pannala	TWN_1773506806179_hy7lddet	t	cmmqk5ofe00gurou9id0exr3g	2026-03-14 16:46:46.179	2026-03-14 16:46:46.179
cmmqk5tpl00ndrou9apy6hvn8	Chilaw	TWN_1773506806184_q43r0201	t	cmmqk5ofq00gwrou92nnpcen3	2026-03-14 16:46:46.184	2026-03-14 16:46:46.184
cmmqk5tpx00nfrou9j2ns6nfb	Nattandiya	TWN_1773506806196_9odunrig	t	cmmqk5ofq00gwrou92nnpcen3	2026-03-14 16:46:46.196	2026-03-14 16:46:46.196
cmmqk5t8700kbrou97kxsjfz1	Veyangoda	TWN_1773506805558_ce86xptq	t	cmmqk5on700i4rou93qasabha	2026-03-14 16:46:45.559	2026-03-14 16:46:45.559
cmmqk5t8v00kdrou93x75hlwj	Katukurunda	TWN_1773506805583_zshc5kjo	t	cmmqk5oo400iarou98mevk1mx	2026-03-14 16:46:45.583	2026-03-14 16:46:45.583
cmmqk5t9n00kfrou9vsu703s8	Payagala	TWN_1773506805610_vovg27lq	t	cmmqk5oo400iarou98mevk1mx	2026-03-14 16:46:45.611	2026-03-14 16:46:45.611
cmmqk5t9z00khrou9fwmn27n1	Nalluruwa	TWN_1773506805623_2hjsf2w3	t	cmmqk5opg00ijrou9taqyw9f5	2026-03-14 16:46:45.623	2026-03-14 16:46:45.623
cmmqk5ta700kirou9w0uefj5b	Pallimulla	TWN_1773506805630_je4e9ah4	t	cmmqk5opg00ijrou9taqyw9f5	2026-03-14 16:46:45.631	2026-03-14 16:46:45.631
cmmqk5taj00kkrou9zlkc768y	Millaniya	TWN_1773506805643_fyr230q9	t	cmmqk5onn00i7rou9uflf9m45	2026-03-14 16:46:45.643	2026-03-14 16:46:45.643
cmmqk5tb100knrou9tus8q3q9	Bandaragama	TWN_1773506805660_vjn4fmuf	t	cmmqk5opg00ijrou9taqyw9f5	2026-03-14 16:46:45.661	2026-03-14 16:46:45.661
cmmqk5tbj00kqrou9opthsni2	Dharga Town	TWN_1773506805678_w37t1i40	t	cmmqk5omq00i1rou9n8e971lg	2026-03-14 16:46:45.679	2026-03-14 16:46:45.679
cmmqk5tbu00ksrou9dmzl0fa1	Molligoda	TWN_1773506805689_254cuagn	t	cmmqk5opp00ilrou9hpa8apq9	2026-03-14 16:46:45.689	2026-03-14 16:46:45.689
cmmqk5tc400kurou913wdevzw	Matugama	TWN_1773506805699_k0jo0ved	t	cmmqk5oo400iarou98mevk1mx	2026-03-14 16:46:45.699	2026-03-14 16:46:45.699
cmmqk5tce00kwrou9org1mneq	Bulathsinhala	TWN_1773506805709_x38rvbqv	t	cmmqk5oo400iarou98mevk1mx	2026-03-14 16:46:45.71	2026-03-14 16:46:45.71
cmmqk5tco00kyrou95ypo6y3x	Ampitiya	TWN_1773506805720_h774cvj4	t	cmmqk5obu00g6rou9c1mxp6s0	2026-03-14 16:46:45.72	2026-03-14 16:46:45.72
cmmqk5tcx00l0rou9lhv3s8gs	Digana	TWN_1773506805729_norv9hth	t	cmmqk5obu00g6rou9c1mxp6s0	2026-03-14 16:46:45.729	2026-03-14 16:46:45.729
cmmqk5tda00l2rou9693pztww	Peradeniya	TWN_1773506805742_uirmd99x	t	cmmqk5obu00g6rou9c1mxp6s0	2026-03-14 16:46:45.742	2026-03-14 16:46:45.742
cmmqk5tdl00l4rou9ckdv8678	Ulapane	TWN_1773506805753_zkzu8f3v	t	cmmqk5obe00g3rou9p5vjhhaw	2026-03-14 16:46:45.753	2026-03-14 16:46:45.753
cmmqk5tdv00l6rou9sh7ltj9w	Ginigathhena	TWN_1773506805763_cb43r3wc	t	cmmqk5ocd00g9rou9p5egw0ah	2026-03-14 16:46:45.763	2026-03-14 16:46:45.763
cmmqk5te400l8rou99j6n3coh	Pilimathalawa	TWN_1773506805771_1718jw5m	t	cmmqk5obo00g5rou965hjttt2	2026-03-14 16:46:45.772	2026-03-14 16:46:45.772
cmmqk5tee00larou9ly2avvdl	Ukuwela	TWN_1773506805781_07rljibz	t	cmmqk5oc100g7rou9yfr283x6	2026-03-14 16:46:45.781	2026-03-14 16:46:45.781
cmmqk5teo00lcrou9zmvdti2b	Yatawatta	TWN_1773506805792_v9r0oxjh	t	cmmqk5oc100g7rou9yfr283x6	2026-03-14 16:46:45.792	2026-03-14 16:46:45.792
cmmqk5tey00lerou9ru9tn741	Galewela	TWN_1773506805802_xyem6y5r	t	cmmqk5ob500g1rou92fprvf39	2026-03-14 16:46:45.802	2026-03-14 16:46:45.802
cmmqk5tf900lgrou9y3c6nuzr	Inamaluwa	TWN_1773506805813_qnc934ac	t	cmmqk5ob500g1rou92fprvf39	2026-03-14 16:46:45.813	2026-03-14 16:46:45.813
cmmqk5tfj00lirou917yp6c4y	Blackpool	TWN_1773506805823_q1gfe446	t	cmmqk5oci00garou99s3pnf3w	2026-03-14 16:46:45.823	2026-03-14 16:46:45.823
cmmqk5tfu00lkrou9b2kqoqfn	Maskeliya	TWN_1773506805834_5dkoorai	t	cmmqk5obj00g4rou9ck3e1by4	2026-03-14 16:46:45.834	2026-03-14 16:46:45.834
cmmqk5tg400lmrou9m1dygysx	Lindula	TWN_1773506805844_jetie35q	t	cmmqk5ocr00gcrou98nybmdoy	2026-03-14 16:46:45.844	2026-03-14 16:46:45.844
cmmqk5tge00lorou9vrklwc2j	Narigama	TWN_1773506805853_jtbe7eg8	t	cmmqk5okd00horou95u1yk1ct	2026-03-14 16:46:45.853	2026-03-14 16:46:45.853
cmmqk5tgo00lqrou9gurx9mzl	Urawatta	TWN_1773506805864_2x5rhxwk	t	cmmqk5ojm00hjrou9trsct3ns	2026-03-14 16:46:45.864	2026-03-14 16:46:45.864
cmmqk5th000lsrou9i5e2l64s	Madiha	TWN_1773506805876_394cm5k8	t	cmmqk5oko00hqrou9d99bg0r7	2026-03-14 16:46:45.876	2026-03-14 16:46:45.876
cmmqk5thb00lurou908dvova3	Nupe	TWN_1773506805886_prcz5gpj	t	cmmqk5oko00hqrou9d99bg0r7	2026-03-14 16:46:45.886	2026-03-14 16:46:45.886
cmmqk5thm00lwrou9nwa74eqg	Hakmana	TWN_1773506805897_dxa5v07f	t	cmmqk5oko00hqrou9d99bg0r7	2026-03-14 16:46:45.897	2026-03-14 16:46:45.897
cmmqk5thx00lyrou9vq1lvsvy	Pelena	TWN_1773506805908_2tis0zpy	t	cmmqk5ol500htrou9l14ka689	2026-03-14 16:46:45.908	2026-03-14 16:46:45.908
cmmqk5ti700m0rou9sirtvd64	Ambalantota	TWN_1773506805918_dvn9qrlk	t	cmmqk5ok800hnrou9bvr65r64	2026-03-14 16:46:45.919	2026-03-14 16:46:45.919
cmmqk5tii00m2rou99ptcbv4e	Angunakolapelessa	TWN_1773506805929_05zdgpd3	t	cmmqk5ok800hnrou9bvr65r64	2026-03-14 16:46:45.929	2026-03-14 16:46:45.929
cmmqk5tj000m5rou9ww2lkx7d	Tissamaharama	TWN_1773506805948_yce7bgds	t	cmmqk5ok800hnrou9bvr65r64	2026-03-14 16:46:45.948	2026-03-14 16:46:45.948
cmmqk5tjb00m7rou9m8ibxhfz	Chunnakam	TWN_1773506805959_k0o48335	t	cmmqk5ogd00h0rou992rp8o79	2026-03-14 16:46:45.959	2026-03-14 16:46:45.959
cmmqk5tjl00m9rou9no3d9p2s	Nelliady	TWN_1773506805969_q8sc7riv	t	cmmqk5ogd00h0rou992rp8o79	2026-03-14 16:46:45.969	2026-03-14 16:46:45.969
cmmqk5tjv00mbrou9enonrre6	Point Pedro	TWN_1773506805979_ufz0mxv0	t	cmmqk5ogd00h0rou992rp8o79	2026-03-14 16:46:45.979	2026-03-14 16:46:45.979
cmmqk5tk700mdrou94hrmvo8z	Paranthan	TWN_1773506805990_jbf5xkqx	t	cmmqk5ogj00h1rou9re4y8vz3	2026-03-14 16:46:45.991	2026-03-14 16:46:45.991
cmmqk5tkh00mfrou9oor7gj56	Pallai	TWN_1773506806001_4x9x51qa	t	cmmqk5ogj00h1rou9re4y8vz3	2026-03-14 16:46:46.001	2026-03-14 16:46:46.001
cmmqk5tks00mhrou9gozwd4o7	Murunkan	TWN_1773506806012_fuurzny9	t	cmmqk5ogo00h2rou9v7ad2jf7	2026-03-14 16:46:46.012	2026-03-14 16:46:46.012
cmmqk5tl300mjrou99iza2der	Puthukkudiyiruppu	TWN_1773506806022_5f88e4q5	t	cmmqk5ogv00h3rou9pb3roq3z	2026-03-14 16:46:46.023	2026-03-14 16:46:46.023
cmmqk5tle00mlrou9wnw8nj7x	Thunukkai	TWN_1773506806034_skxmdkit	t	cmmqk5ogv00h3rou9pb3roq3z	2026-03-14 16:46:46.034	2026-03-14 16:46:46.034
cmmqk5tlp00mnrou9sulcuoak	Cheddikulam	TWN_1773506806044_r71drcrj	t	cmmqk5ohy00harou9y1qhbwxm	2026-03-14 16:46:46.045	2026-03-14 16:46:46.045
cmmqk5tlz00mprou9h5lpb72f	Kinniya	TWN_1773506806055_taze726i	t	cmmqk5oe600gmrou9bzei363x	2026-03-14 16:46:46.055	2026-03-14 16:46:46.055
cmmqk5tma00mrrou9zro9qalp	Kantale	TWN_1773506806066_gl1r9til	t	cmmqk5oe600gmrou9bzei363x	2026-03-14 16:46:46.066	2026-03-14 16:46:46.066
cmmqk5tml00mtrou9u1pd8kh8	Eravur	TWN_1773506806077_adfpsj26	t	cmmqk5od700gfrou9wmtwq6np	2026-03-14 16:46:46.077	2026-03-14 16:46:46.077
cmmqk5tmw00mvrou9lg3yzc32	Valaichchenai	TWN_1773506806088_kiliditw	t	cmmqk5od700gfrou9wmtwq6np	2026-03-14 16:46:46.088	2026-03-14 16:46:46.088
cmmqk5tn600mxrou98r4xxt40	Kalmunai	TWN_1773506806098_bthgplrt	t	cmmqk5od200gerou9lwr0rkvv	2026-03-14 16:46:46.098	2026-03-14 16:46:46.098
cmmqk5tnh00mzrou9uybtu0f7	Sammanthurai	TWN_1773506806109_56zt3xiz	t	cmmqk5od200gerou9lwr0rkvv	2026-03-14 16:46:46.109	2026-03-14 16:46:46.109
cmmqk5tns00n1rou93o76vzgm	Mihintale	TWN_1773506806119_z59woa23	t	cmmqk5oeb00gnrou9nosuntu4	2026-03-14 16:46:46.119	2026-03-14 16:46:46.119
cmmqk5to200n3rou9knwmxkzo	Medawachchiya	TWN_1773506806130_hd3otah8	t	cmmqk5oeb00gnrou9nosuntu4	2026-03-14 16:46:46.13	2026-03-14 16:46:46.13
cmmqk5toe00n5rou94a7yfyex	Hingurakgoda	TWN_1773506806142_o1oy36sp	t	cmmqk5oew00grrou9mhisc2vr	2026-03-14 16:46:46.142	2026-03-14 16:46:46.142
cmmqk5top00n7rou9oyl1ghr4	Kaduruwela	TWN_1773506806153_nhs82hpi	t	cmmqk5oew00grrou9mhisc2vr	2026-03-14 16:46:46.153	2026-03-14 16:46:46.153
cmmqk5tp000n9rou91c00psqk	Wariyapola	TWN_1773506806164_kw6frdq4	t	cmmqk5ofe00gurou9id0exr3g	2026-03-14 16:46:46.164	2026-03-14 16:46:46.164
cmmqk5tpa00nbrou9o3zj85qa	Narammala	TWN_1773506806174_ml2g2gza	t	cmmqk5ofe00gurou9id0exr3g	2026-03-14 16:46:46.174	2026-03-14 16:46:46.174
cmmqk5tpr00nerou93i1ia79m	Wennappuwa	TWN_1773506806190_cs4wodk6	t	cmmqk5ofq00gwrou92nnpcen3	2026-03-14 16:46:46.19	2026-03-14 16:46:46.19
cmmqk5tq300ngrou9lhm7efp3	Anamaduwa	TWN_1773506806203_svpeg2ut	t	cmmqk5ofq00gwrou92nnpcen3	2026-03-14 16:46:46.203	2026-03-14 16:46:46.203
cmmqk5tqf00nirou9dsvtqmog	Embilipitiya	TWN_1773506806215_yudybjr0	t	cmmqk5oj100hfrou9pqe7f2hl	2026-03-14 16:46:46.215	2026-03-14 16:46:46.215
cmmqk5tqq00nkrou917mtb3vb	Kahawatta	TWN_1773506806225_d3o8alz4	t	cmmqk5oj100hfrou9pqe7f2hl	2026-03-14 16:46:46.226	2026-03-14 16:46:46.226
cmmqk5tqa00nhrou9h8ku7olo	Balangoda	TWN_1773506806209_izrqs59p	t	cmmqk5oj100hfrou9pqe7f2hl	2026-03-14 16:46:46.209	2026-03-14 16:46:46.209
cmmqk5tqk00njrou919c6haoo	Pelmadulla	TWN_1773506806220_3x20c78n	t	cmmqk5oj100hfrou9pqe7f2hl	2026-03-14 16:46:46.22	2026-03-14 16:46:46.22
cmmqk5tqv00nlrou9jevkppil	Rambukkana	TWN_1773506806230_6v1s0fbx	t	cmmqk5oie00hdrou9fmnap56l	2026-03-14 16:46:46.231	2026-03-14 16:46:46.231
cmmqk5tr500nnrou964hbmire	Mawanella	TWN_1773506806241_q3kcqsj6	t	cmmqk5oie00hdrou9fmnap56l	2026-03-14 16:46:46.241	2026-03-14 16:46:46.241
cmmqk5trf00nprou9s8yk9dj4	Bandarawela	TWN_1773506806251_l8ldo2ws	t	cmmqk5olg00hvrou9pnay91ou	2026-03-14 16:46:46.251	2026-03-14 16:46:46.251
cmmqk5trq00nrrou959lbq4tx	Ella	TWN_1773506806262_mxm91alv	t	cmmqk5olg00hvrou9pnay91ou	2026-03-14 16:46:46.262	2026-03-14 16:46:46.262
cmmqk5ts200ntrou9tghzataq	Diyatalawa	TWN_1773506806273_3undf8g0	t	cmmqk5olg00hvrou9pnay91ou	2026-03-14 16:46:46.273	2026-03-14 16:46:46.273
cmmqk5tsc00nvrou9zlqxoi4n	Bibile	TWN_1773506806284_d66znc96	t	cmmqk5omg00hzrou9mflz9q0v	2026-03-14 16:46:46.284	2026-03-14 16:46:46.284
cmmqk5tr000nmrou91qz1ga63	Warakapola	TWN_1773506806236_qzcsk5v1	t	cmmqk5oie00hdrou9fmnap56l	2026-03-14 16:46:46.236	2026-03-14 16:46:46.236
cmmqk5tra00norou9d7z6z8q9	Ruwanwella	TWN_1773506806246_782chlyy	t	cmmqk5oie00hdrou9fmnap56l	2026-03-14 16:46:46.246	2026-03-14 16:46:46.246
cmmqk5trl00nqrou913vqo9nm	Haputale	TWN_1773506806257_gggdeo1b	t	cmmqk5olg00hvrou9pnay91ou	2026-03-14 16:46:46.257	2026-03-14 16:46:46.257
cmmqk5trv00nsrou98tcwvwrf	Welimada	TWN_1773506806267_66e2m9bb	t	cmmqk5olg00hvrou9pnay91ou	2026-03-14 16:46:46.267	2026-03-14 16:46:46.267
cmmqk5ts700nurou9dl77qe6e	Wellawaya	TWN_1773506806279_6cfiubl7	t	cmmqk5omg00hzrou9mflz9q0v	2026-03-14 16:46:46.279	2026-03-14 16:46:46.279
cmmqk5tsi00nwrou98ks2waki	Buttala	TWN_1773506806289_223nsfif	t	cmmqk5omg00hzrou9mflz9q0v	2026-03-14 16:46:46.29	2026-03-14 16:46:46.29
cmmqk6ddk00nyrou91yf5ivdo	Dehiwala	TWN_1773506831672_ikhkefb5	t	cmmqk66qo00nxrou9fjconvwc	2026-03-14 16:47:11.672	2026-03-14 16:47:11.672
cmmqk6ddt00nzrou9g7lqege2	Mount Lavinia	TWN_1773506831680_0a054pre	t	cmmqk66qo00nxrou9fjconvwc	2026-03-14 16:47:11.68	2026-03-14 16:47:11.68
cmmqk6ddz00o0rou9cgi1sdrk	Rathmalana	TWN_1773506831686_xwmsm24t	t	cmmqk66qo00nxrou9fjconvwc	2026-03-14 16:47:11.686	2026-03-14 16:47:11.686
cmmqk6de300o1rou9dhnhgkpi	Attidiya	TWN_1773506831691_ky8x3ye9	t	cmmqk66qo00nxrou9fjconvwc	2026-03-14 16:47:11.691	2026-03-14 16:47:11.691
cmmqk6dea00o2rou9txxwtqst	Kalubowila	TWN_1773506831697_w5x6j0sm	t	cmmqk66qo00nxrou9fjconvwc	2026-03-14 16:47:11.697	2026-03-14 16:47:11.697
cmmqk6deg00o3rou9el4vj84c	Kohuwala	TWN_1773506831704_y0jcj7rp	t	cmmqk66qo00nxrou9fjconvwc	2026-03-14 16:47:11.704	2026-03-14 16:47:11.704
cmmqk6del00o4rou9ygphcc9a	Karagampitiya	TWN_1773506831709_agbhlsso	t	cmmqk66qo00nxrou9fjconvwc	2026-03-14 16:47:11.709	2026-03-14 16:47:11.709
cmmqk76yz00o6rou9b036e1si	Ekala	TWN_1773506870026_nxh34lug	t	cmmqk70vb00o5rou9kwmqbc5c	2026-03-14 16:47:50.027	2026-03-14 16:47:50.027
cmmqk76z700o7rou9wf2e7sla	Kapuwatta	TWN_1773506870035_s4apvxwy	t	cmmqk70vb00o5rou9kwmqbc5c	2026-03-14 16:47:50.035	2026-03-14 16:47:50.035
cmmqk76zd00o8rou9q3s16fft	Kandana	TWN_1773506870041_wlo6ty70	t	cmmqk70vb00o5rou9kwmqbc5c	2026-03-14 16:47:50.041	2026-03-14 16:47:50.041
cmmqk76zi00o9rou9ou9md86m	Dandugama	TWN_1773506870045_hqy3clio	t	cmmqk70vb00o5rou9kwmqbc5c	2026-03-14 16:47:50.046	2026-03-14 16:47:50.046
cmmqk7si000obrou9lwp4r1gk	Unawatuna	TWN_1773506897927_8ow94yp5	t	cmmqk7jdp00oarou9049qw8s9	2026-03-14 16:48:17.927	2026-03-14 16:48:17.927
cmmqk7si900ocrou9yx4xp3a9	Karapitiya	TWN_1773506897937_2loulue7	t	cmmqk7jdp00oarou9049qw8s9	2026-03-14 16:48:17.937	2026-03-14 16:48:17.937
cmmqk7sif00odrou90bkdiw81	Boossa	TWN_1773506897942_wrd41cex	t	cmmqk7jdp00oarou9049qw8s9	2026-03-14 16:48:17.942	2026-03-14 16:48:17.942
cmmqk7sik00oerou901ln80o3	Baddegama	TWN_1773506897948_f1s4q2dt	t	cmmqk7jdp00oarou9049qw8s9	2026-03-14 16:48:17.948	2026-03-14 16:48:17.948
cmmqk7sir00ofrou9juiquyyc	Elpitiya	TWN_1773506897955_nonm9jhq	t	cmmqk7jdp00oarou9049qw8s9	2026-03-14 16:48:17.955	2026-03-14 16:48:17.955
cmmqutc6l000myku97ifmeca4	Kaduwela	TWN_1773524699371_h4vc9d31	t	cmmqush6l000lyku9sk8ydvna	2026-03-14 21:44:59.373	2026-03-14 21:44:59.373
cmmqutgfv000nyku97qz892sz	Battaramulla	TWN_1773524704890_gjekqyy9	t	cmmqush6l000lyku9sk8ydvna	2026-03-14 21:45:04.89	2026-03-14 21:45:04.89
cmmqutkgj000oyku9h7vyz9sp	Athurugiriya	TWN_1773524710098_yn5mi6mn	t	cmmqush6l000lyku9sk8ydvna	2026-03-14 21:45:10.098	2026-03-14 21:45:10.098
cmmquxpna000zyku9nrh0e0r5	Hettipola	TWN_1773524903445_x819rpbs	t	cmmqk5ofe00gurou9id0exr3g	2026-03-14 21:48:23.445	2026-03-14 21:48:23.445
cmmquyt6h0012yku9ugl15zya	Maho	TWN_1773524954680_6ze7mudw	t	cmmqk5ofe00gurou9id0exr3g	2026-03-14 21:49:14.68	2026-03-14 21:49:14.68
\.


--
-- Data for Name: trip_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.trip_logs (id, "driverId", "tripDate", "startTime", "endTime", "startMeter", "endMeter", "totalKm", "stopsCount", "routeNotes", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, "fullName", email, phone, "passwordHash", status, "roleId", "createdAt", "updatedAt", username) FROM stdin;
cmmq7xcc70010ggu99sfky9au	Driverone	driver1@villsdairy.lk	+94700000003	$2b$10$2H9VtFo4e8Hm/YbZ6CSP8OwNy852CjHH7hdEq/rova8rdUGREJuNO	ACTIVE	cmmnqncfi0002fou9rb7r0da0	2026-03-14 11:04:15.031	2026-03-14 11:04:15.031	driver1
cmmq7yhqy001oggu9hqdstf9q	Driverthree	driver3@villsdairy.lk	+94700000005	$2b$10$P0VjqgeIv90uYe6Dd7IWIukp.MId7SKcGSFFWHFkg3yeGtTL0a.Ia	ACTIVE	cmmnqncfi0002fou9rb7r0da0	2026-03-14 11:05:08.697	2026-03-14 11:05:08.697	driver3
cmmq7xvtq001nggu9vw40hxbi	Drivertwo	driver2@villsdairy.lk	+94700000004	$2b$10$jlko7z/IpC.FeKGkWeTuXegG37Qa9nRZjHGPd3G7tJy2pKNp6jS/C	ACTIVE	cmmnqncfi0002fou9rb7r0da0	2026-03-14 11:04:40.286	2026-03-14 11:05:15.605	driver2
cmmq3n2oa0000ggu97uco3y02	Charith	charith@villsdairy.lk	+94779334804	$2b$10$fMBOw84VeQXTGCZ/ukrR8OKaGc2rE7jMR9p1.aJorAsvvXHVmEpoi	ACTIVE	cmmnqncff0001fou939j9j144	2026-03-14 09:04:17.481	2026-03-14 09:18:43.503	charith
cmmq4audt000oggu95y2rr5cr	Deshapriya	deshapriya@villsdairy.lk	+94773570912	$2b$10$5aXonMDcfKVG2pp//OFZlOqC0cEln8duisOvp8PSvELPhWMFaf60W	ACTIVE	cmmnqncff0001fou939j9j144	2026-03-14 09:22:46.481	2026-03-14 09:22:46.481	deshapriya
cmmnqnchi0004fou9584996le	System Admin	admin@dairy.local	+94763345979	$2b$10$P7m9.R91Ljwvycfx1/Od.ujtmh5u6nMj2wD4mU/4TpO/mL2/98Kgq	ACTIVE	cmmnqncdx0000fou9arvul6lz	2026-03-12 17:25:02.838	2026-03-14 09:27:11.692	admin
cmmq46nwo000nggu9cgejjtgn	Chamila	chamila@villsdairy.lk	+94773454525	$2b$10$nht2y3BZXfu9d4/4SxgWjeNyzCRUStooXbkGzJpgkNDSfwYNXYgJO	ACTIVE	cmmnqncff0001fou939j9j144	2026-03-14 09:19:31.463	2026-03-14 09:28:22.637	chamila
cmmq4j51d000pggu9uodxr62p	Nisansala	nisansala@villsdairy.lk	+94764335329	$2b$10$ViG20aFUuZCtXN.dERmrmOs5wEjbR8Uk8wzss.ltGwq9CDneGF5V6	ACTIVE	cmmnqncff0001fou939j9j144	2026-03-14 09:29:13.537	2026-03-14 09:29:13.537	nisansala
cmmq52wx7000qggu9wcyft2as	Ekanayaka	ekanayaka@villsdairy.lk	+94773128503	$2b$10$QMYsiUIA5G97OYq.q8t52.7B.e87vmxexyhcCWgrAOmd0H2MnfSDG	ACTIVE	cmmnqncff0001fou939j9j144	2026-03-14 09:44:36.138	2026-03-14 09:44:36.138	ekanayaka
cmmq54xhw000rggu9phx510ff	Sameera	sameera@villsdairy.lk	+94770242164	$2b$10$lZohR.x6YiiE1Yh6.kOhmek8ExGgv5yuTHNSEYk9UOMHVZgSv0dq2	ACTIVE	cmmnqncff0001fou939j9j144	2026-03-14 09:46:10.196	2026-03-14 09:46:10.196	sameera
cmmq56fup000sggu9h5oyfe5p	Lawson	lawson@villsdairy.lk	+94777421457	$2b$10$gBQVoLBdp0wJL3oiYY3wa.yY/zVH5hLf2dgJf4EEHw1KoGTts2T1i	ACTIVE	cmmnqncff0001fou939j9j144	2026-03-14 09:47:20.64	2026-03-14 09:47:20.64	lawson
cmmq572lz000tggu92x3dddv7	Athula	athula@villsdairy.lk	+94774161678	$2b$10$333HDi2oOUl39ezzCDOfCul92.9avCGMLUJqUHZEPvuxO02/OTBRW	ACTIVE	cmmnqncff0001fou939j9j144	2026-03-14 09:47:50.134	2026-03-14 09:47:50.134	athula
cmmq5cw4c000uggu9okdu71sh	Kelum	kelum@villsdairy.lk	+94700000000	$2b$10$tm4sGwlTylvx4q3BssAZkOAKfbuEasC8dbP17zxnCV1svtvgil3Tm	ACTIVE	cmmnqncff0001fou939j9j144	2026-03-14 09:52:21.66	2026-03-14 09:52:21.66	kelum
cmmq5dpvr000vggu9w1q5t3ju	Harsha	harsha@villsdairy.lk	+94785264428	$2b$10$4Hgn4WSDl2tU/58Owd/ZZOYfCLteiIn7.mXU06oHY732H9HJI.Rxa	ACTIVE	cmmnqncff0001fou939j9j144	2026-03-14 09:53:00.231	2026-03-14 09:53:00.231	harsha
cmmq5iq6l000wggu98uc4vuup	Ruchira	ruchira@villsdairy.lk	+94777799920	$2b$10$AWLqAZgFI0xnCWQbC0D32OW3/3JaRPX7MFL/Jko83s.zOWZmhhON.	ACTIVE	cmmnqncff0001fou939j9j144	2026-03-14 09:56:53.9	2026-03-14 09:56:53.9	ruchira
cmmq5kwiu000xggu99o2vjv2s	Irosha	irosha@villsdairy.lk	+94700000001	$2b$10$Tc6BnUPpKq6dJEuawHS87.IWt2pgHYq4/P9k1XBTD4Qk5rENok52q	ACTIVE	cmmnqncff0001fou939j9j144	2026-03-14 09:58:35.43	2026-03-14 09:58:35.43	irosha
cmmq5m2m5000yggu9a4jyk20b	Sachithra	sachithra@villsdairy.lk	+94700000002	$2b$10$XzcUw6QC6H6rfspqTikLZuFadO782s0tacUxseq0S4NaXxHyQno3C	ACTIVE	cmmnqncff0001fou939j9j144	2026-03-14 09:59:29.98	2026-03-14 09:59:29.98	sachithra
cmmq5mt43000zggu9r6l26tvz	Lakshitha	lakshitha@villsdairy.lk	+94772149019	$2b$10$7iD0J0ctm79EVOjiyCzVGuxZj2zICKcoUJxxuBMPNBHrIeSxhec4W	ACTIVE	cmmnqncff0001fou939j9j144	2026-03-14 10:00:04.323	2026-03-14 10:00:04.323	lakshitha
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: agent_profiles agent_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_profiles
    ADD CONSTRAINT agent_profiles_pkey PRIMARY KEY (id);


--
-- Name: cities cities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_pkey PRIMARY KEY (id);


--
-- Name: city_assignments city_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.city_assignments
    ADD CONSTRAINT city_assignments_pkey PRIMARY KEY (id);


--
-- Name: company_profiles company_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_profiles
    ADD CONSTRAINT company_profiles_pkey PRIMARY KEY (id);


--
-- Name: company_settings company_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_settings
    ADD CONSTRAINT company_settings_pkey PRIMARY KEY (id);


--
-- Name: discounts discounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discounts
    ADD CONSTRAINT discounts_pkey PRIMARY KEY (id);


--
-- Name: dispatches dispatches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dispatches
    ADD CONSTRAINT dispatches_pkey PRIMARY KEY (id);


--
-- Name: districts districts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_pkey PRIMARY KEY (id);


--
-- Name: driver_profiles driver_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver_profiles
    ADD CONSTRAINT driver_profiles_pkey PRIMARY KEY (id);


--
-- Name: fuel_allocations fuel_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fuel_allocations
    ADD CONSTRAINT fuel_allocations_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: notification_templates notification_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: regions regions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regions
    ADD CONSTRAINT regions_pkey PRIMARY KEY (id);


--
-- Name: return_items return_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.return_items
    ADD CONSTRAINT return_items_pkey PRIMARY KEY (id);


--
-- Name: returns returns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.returns
    ADD CONSTRAINT returns_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: shops shops_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shops
    ADD CONSTRAINT shops_pkey PRIMARY KEY (id);


--
-- Name: stock_allocations stock_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_allocations
    ADD CONSTRAINT stock_allocations_pkey PRIMARY KEY (id);


--
-- Name: town_assignments town_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.town_assignments
    ADD CONSTRAINT town_assignments_pkey PRIMARY KEY (id);


--
-- Name: towns towns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.towns
    ADD CONSTRAINT towns_pkey PRIMARY KEY (id);


--
-- Name: trip_logs trip_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trip_logs
    ADD CONSTRAINT trip_logs_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: agent_profiles_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "agent_profiles_userId_key" ON public.agent_profiles USING btree ("userId");


--
-- Name: cities_regionId_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "cities_regionId_name_key" ON public.cities USING btree ("regionId", name);


--
-- Name: city_assignments_cityId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "city_assignments_cityId_key" ON public.city_assignments USING btree ("cityId");


--
-- Name: company_profiles_businessType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "company_profiles_businessType_idx" ON public.company_profiles USING btree ("businessType");


--
-- Name: company_profiles_companyCode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "company_profiles_companyCode_key" ON public.company_profiles USING btree ("companyCode");


--
-- Name: company_profiles_industryType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "company_profiles_industryType_idx" ON public.company_profiles USING btree ("industryType");


--
-- Name: districts_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX districts_code_key ON public.districts USING btree (code);


--
-- Name: driver_profiles_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "driver_profiles_userId_key" ON public.driver_profiles USING btree ("userId");


--
-- Name: invoices_invoiceNo_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "invoices_invoiceNo_key" ON public.invoices USING btree ("invoiceNo");


--
-- Name: invoices_orderId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "invoices_orderId_key" ON public.invoices USING btree ("orderId");


--
-- Name: orders_orderNo_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "orders_orderNo_key" ON public.orders USING btree ("orderNo");


--
-- Name: permissions_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX permissions_code_key ON public.permissions USING btree (code);


--
-- Name: products_sku_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);


--
-- Name: regions_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX regions_code_key ON public.regions USING btree (code);


--
-- Name: regions_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX regions_name_key ON public.regions USING btree (name);


--
-- Name: returns_returnNo_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "returns_returnNo_key" ON public.returns USING btree ("returnNo");


--
-- Name: role_permissions_roleId_permissionId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "role_permissions_roleId_permissionId_key" ON public.role_permissions USING btree ("roleId", "permissionId");


--
-- Name: roles_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX roles_code_key ON public.roles USING btree (code);


--
-- Name: roles_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);


--
-- Name: shops_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX shops_code_key ON public.shops USING btree (code);


--
-- Name: shops_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX shops_email_key ON public.shops USING btree (email);


--
-- Name: town_assignments_townId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "town_assignments_townId_key" ON public.town_assignments USING btree ("townId");


--
-- Name: towns_cityId_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "towns_cityId_name_key" ON public.towns USING btree ("cityId", name);


--
-- Name: towns_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX towns_code_key ON public.towns USING btree (code);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_phone_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_phone_key ON public.users USING btree (phone);


--
-- Name: users_username_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


--
-- Name: activity_logs activity_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: agent_profiles agent_profiles_regionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_profiles
    ADD CONSTRAINT "agent_profiles_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES public.regions(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: agent_profiles agent_profiles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_profiles
    ADD CONSTRAINT "agent_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cities cities_districtId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT "cities_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES public.districts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cities cities_regionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT "cities_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES public.regions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: city_assignments city_assignments_agentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.city_assignments
    ADD CONSTRAINT "city_assignments_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES public.agent_profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: city_assignments city_assignments_cityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.city_assignments
    ADD CONSTRAINT "city_assignments_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES public.cities(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: city_assignments city_assignments_driverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.city_assignments
    ADD CONSTRAINT "city_assignments_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES public.driver_profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: discounts discounts_agentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discounts
    ADD CONSTRAINT "discounts_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES public.agent_profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: discounts discounts_approvedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discounts
    ADD CONSTRAINT "discounts_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: discounts discounts_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discounts
    ADD CONSTRAINT "discounts_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: discounts discounts_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discounts
    ADD CONSTRAINT "discounts_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public.shops(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: dispatches dispatches_driverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dispatches
    ADD CONSTRAINT "dispatches_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES public.driver_profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: dispatches dispatches_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dispatches
    ADD CONSTRAINT "dispatches_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: districts districts_regionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT "districts_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES public.regions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: driver_profiles driver_profiles_regionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver_profiles
    ADD CONSTRAINT "driver_profiles_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES public.regions(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: driver_profiles driver_profiles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver_profiles
    ADD CONSTRAINT "driver_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fuel_allocations fuel_allocations_driverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fuel_allocations
    ADD CONSTRAINT "fuel_allocations_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES public.driver_profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoices invoices_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoices invoices_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public.shops(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: notifications notifications_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public.shops(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_items order_items_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: orders orders_agentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES public.agent_profiles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_cityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES public.cities(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: orders orders_driverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES public.driver_profiles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_placedByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_placedByUserId_fkey" FOREIGN KEY ("placedByUserId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: orders orders_regionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES public.regions(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: orders orders_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public.shops(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payments payments_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payments payments_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public.shops(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: return_items return_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.return_items
    ADD CONSTRAINT "return_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: return_items return_items_returnId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.return_items
    ADD CONSTRAINT "return_items_returnId_fkey" FOREIGN KEY ("returnId") REFERENCES public.returns(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: returns returns_agentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.returns
    ADD CONSTRAINT "returns_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES public.agent_profiles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: returns returns_driverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.returns
    ADD CONSTRAINT "returns_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES public.driver_profiles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: returns returns_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.returns
    ADD CONSTRAINT "returns_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public.shops(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: role_permissions role_permissions_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: shops shops_assignedAgentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shops
    ADD CONSTRAINT "shops_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES public.agent_profiles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: shops shops_assignedDriverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shops
    ADD CONSTRAINT "shops_assignedDriverId_fkey" FOREIGN KEY ("assignedDriverId") REFERENCES public.driver_profiles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: shops shops_cityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shops
    ADD CONSTRAINT "shops_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES public.cities(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: shops shops_regionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shops
    ADD CONSTRAINT "shops_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES public.regions(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_allocations stock_allocations_agentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_allocations
    ADD CONSTRAINT "stock_allocations_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES public.agent_profiles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stock_allocations stock_allocations_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_allocations
    ADD CONSTRAINT "stock_allocations_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: town_assignments town_assignments_agentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.town_assignments
    ADD CONSTRAINT "town_assignments_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES public.agent_profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: town_assignments town_assignments_driverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.town_assignments
    ADD CONSTRAINT "town_assignments_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES public.driver_profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: town_assignments town_assignments_townId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.town_assignments
    ADD CONSTRAINT "town_assignments_townId_fkey" FOREIGN KEY ("townId") REFERENCES public.towns(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: towns towns_cityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.towns
    ADD CONSTRAINT "towns_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES public.cities(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: trip_logs trip_logs_driverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trip_logs
    ADD CONSTRAINT "trip_logs_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES public.driver_profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: users users_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict OIfLclpWfQboQLcfsA2ps5bgU6DIb47CYpWmDbphHQ812w1MosV2ArR2SKRIVSY

