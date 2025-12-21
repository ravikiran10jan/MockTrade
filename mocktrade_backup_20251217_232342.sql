--
-- PostgreSQL database dump
--

\restrict Jpm8PkNbNbPhyZeJTRUfUsznfiKI7PdnOnacPQdnT8ptlzQh9T5NU3DdwqBrU9Y

-- Dumped from database version 16.11 (Debian 16.11-1.pgdg13+1)
-- Dumped by pg_dump version 16.11 (Debian 16.11-1.pgdg13+1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account (
    account_id character varying NOT NULL,
    code character varying,
    name character varying,
    status character varying,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.account OWNER TO postgres;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO postgres;

--
-- Name: audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_log (
    audit_id character varying NOT NULL,
    entity_type character varying,
    entity_id character varying,
    action character varying,
    user_id character varying,
    "timestamp" timestamp without time zone,
    before_json json,
    after_json json,
    comment character varying
);


ALTER TABLE public.audit_log OWNER TO postgres;

--
-- Name: broker; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.broker (
    broker_id character varying NOT NULL,
    code character varying,
    name character varying,
    status character varying,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.broker OWNER TO postgres;

--
-- Name: broker_enrichment_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.broker_enrichment_mapping (
    rule_id integer NOT NULL,
    source_system character varying NOT NULL,
    account_name character varying NOT NULL,
    broker character varying NOT NULL,
    broker_leid character varying NOT NULL,
    comments character varying,
    active character varying,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.broker_enrichment_mapping OWNER TO postgres;

--
-- Name: broker_enrichment_mapping_rule_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.broker_enrichment_mapping_rule_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.broker_enrichment_mapping_rule_id_seq OWNER TO postgres;

--
-- Name: broker_enrichment_mapping_rule_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.broker_enrichment_mapping_rule_id_seq OWNED BY public.broker_enrichment_mapping.rule_id;


--
-- Name: clearer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clearer (
    clearer_id character varying NOT NULL,
    code character varying,
    name character varying,
    leid character varying,
    status character varying,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.clearer OWNER TO postgres;

--
-- Name: clearer_enrichment_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clearer_enrichment_mapping (
    rule_id integer NOT NULL,
    source_system character varying NOT NULL,
    account_name character varying NOT NULL,
    clearer character varying NOT NULL,
    clearer_leid character varying NOT NULL,
    comments character varying,
    active character varying,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.clearer_enrichment_mapping OWNER TO postgres;

--
-- Name: clearer_enrichment_mapping_rule_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clearer_enrichment_mapping_rule_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clearer_enrichment_mapping_rule_id_seq OWNER TO postgres;

--
-- Name: clearer_enrichment_mapping_rule_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clearer_enrichment_mapping_rule_id_seq OWNED BY public.clearer_enrichment_mapping.rule_id;


--
-- Name: counterparty; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.counterparty (
    counterparty_code character varying NOT NULL,
    full_legal_name character varying NOT NULL,
    short_name character varying,
    customer_type character varying NOT NULL,
    category character varying,
    business_roles_json json,
    country_of_incorporation character varying,
    lei character varying,
    registered_address_json json,
    operational_address_json json,
    tax_id character varying,
    registration_number character varying,
    primary_contact_json json,
    secondary_contact_json json,
    swift_bic character varying,
    bank_details_json json,
    settlement_instructions character varying,
    default_settlement_account character varying,
    parent_entity character varying,
    counterparty_group character varying,
    intercompany_group character varying,
    relationship_type character varying,
    credit_rating_agency character varying,
    credit_rating character varying,
    internal_risk_rating character varying,
    counterparty_limit_amount numeric,
    counterparty_limit_currency character varying,
    limit_expiry_date date,
    status character varying,
    authorized character varying,
    account_manager character varying,
    created_by character varying,
    created_at timestamp without time zone,
    updated_by character varying,
    updated_at timestamp without time zone
);


ALTER TABLE public.counterparty OWNER TO postgres;

--
-- Name: eod_pnl; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.eod_pnl (
    instrument_id character varying NOT NULL,
    account_id character varying NOT NULL,
    val_date date NOT NULL,
    realized_pnl numeric,
    unrealized_pnl numeric,
    total_pnl numeric
);


ALTER TABLE public.eod_pnl OWNER TO postgres;

--
-- Name: final_settlement_price; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.final_settlement_price (
    instrument_id character varying NOT NULL,
    val_date date NOT NULL,
    final_price numeric
);


ALTER TABLE public.final_settlement_price OWNER TO postgres;

--
-- Name: instrument; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instrument (
    instrument_id character varying NOT NULL,
    symbol character varying NOT NULL,
    name character varying NOT NULL,
    asset_class character varying,
    instrument_type character varying,
    status character varying,
    expiry_date date,
    last_trading_date date,
    created_at timestamp without time zone NOT NULL,
    metadata_json json
);


ALTER TABLE public.instrument OWNER TO postgres;

--
-- Name: instrument_etd; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instrument_etd (
    instrument_id character varying NOT NULL,
    exchange character varying NOT NULL,
    exchange_code character varying,
    mic_code character varying,
    contract_size numeric,
    contract_multiplier double precision,
    tick_size numeric,
    tick_value numeric,
    contract_months character varying,
    last_trade_day_rule character varying,
    last_trade_date_of_year date,
    margin_group character varying,
    initial_margin numeric,
    maintenance_margin numeric,
    trading_hours character varying,
    etd_details_json json
);


ALTER TABLE public.instrument_etd OWNER TO postgres;

--
-- Name: instrument_otc; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instrument_otc (
    instrument_id character varying NOT NULL,
    forward_points_multiplier double precision,
    settlement_type character varying,
    settlement_day_offset integer,
    day_count_convention character varying,
    payment_frequency character varying,
    primary_calendar character varying,
    secondary_calendar character varying,
    is_cleared character varying,
    clearing_house character varying,
    clearing_code character varying,
    bilateral_cpty character varying,
    otc_details_json json
);


ALTER TABLE public.instrument_otc OWNER TO postgres;

--
-- Name: instrument_strategy; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instrument_strategy (
    instrument_id character varying NOT NULL,
    strategy_template character varying,
    payoff_type character varying,
    rebalance_frequency character varying,
    rebalance_threshold double precision,
    pricing_model character varying,
    valuation_currency character varying,
    strategy_details_json json
);


ALTER TABLE public.instrument_strategy OWNER TO postgres;

--
-- Name: module; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.module (
    module_id character varying NOT NULL,
    module_name character varying NOT NULL,
    description character varying,
    status character varying,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.module OWNER TO postgres;

--
-- Name: order_hdr; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_hdr (
    order_id character varying NOT NULL,
    instrument_id character varying,
    side character varying,
    qty integer,
    limit_price numeric,
    type character varying,
    tif character varying,
    trader_id character varying,
    account_id character varying,
    status character varying,
    created_at timestamp without time zone
);


ALTER TABLE public.order_hdr OWNER TO postgres;

--
-- Name: permission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permission (
    permission_id character varying NOT NULL,
    permission_name character varying NOT NULL,
    description character varying,
    status character varying,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.permission OWNER TO postgres;

--
-- Name: portfolio_enrichment_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.portfolio_enrichment_mapping (
    rule_id integer NOT NULL,
    source_system character varying NOT NULL,
    trader_id character varying NOT NULL,
    account_id character varying,
    instrument_code character varying,
    portfolio character varying NOT NULL,
    comments character varying,
    active character varying,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.portfolio_enrichment_mapping OWNER TO postgres;

--
-- Name: portfolio_enrichment_mapping_rule_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.portfolio_enrichment_mapping_rule_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.portfolio_enrichment_mapping_rule_id_seq OWNER TO postgres;

--
-- Name: portfolio_enrichment_mapping_rule_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.portfolio_enrichment_mapping_rule_id_seq OWNED BY public.portfolio_enrichment_mapping.rule_id;


--
-- Name: position_daily; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.position_daily (
    instrument_id character varying NOT NULL,
    account_id character varying NOT NULL,
    val_date date NOT NULL,
    net_qty integer,
    open_qty integer,
    close_qty integer
);


ALTER TABLE public.position_daily OWNER TO postgres;

--
-- Name: role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role (
    role_id character varying NOT NULL,
    role_name character varying NOT NULL,
    description character varying,
    status character varying,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.role OWNER TO postgres;

--
-- Name: role_permission_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permission_mapping (
    mapping_id character varying NOT NULL,
    role_id character varying NOT NULL,
    module_id character varying NOT NULL,
    permission_id character varying NOT NULL,
    status character varying,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.role_permission_mapping OWNER TO postgres;

--
-- Name: settlement_price; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settlement_price (
    instrument_id character varying NOT NULL,
    val_date date NOT NULL,
    settle_price numeric
);


ALTER TABLE public.settlement_price OWNER TO postgres;

--
-- Name: strategy_leg; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.strategy_leg (
    leg_id character varying NOT NULL,
    strategy_id character varying NOT NULL,
    component_instrument_id character varying NOT NULL,
    leg_sequence integer,
    side character varying,
    ratio numeric,
    quantity_type character varying,
    hedge_ratio double precision,
    leg_details_json json,
    status character varying,
    created_at timestamp without time zone
);


ALTER TABLE public.strategy_leg OWNER TO postgres;

--
-- Name: trade; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trade (
    trade_id character varying NOT NULL,
    order_id character varying,
    instrument_id character varying,
    side character varying,
    qty integer,
    price double precision,
    exec_time timestamp without time zone,
    trader_id character varying,
    broker_id character varying,
    account_id character varying,
    status character varying,
    cancellation_reason character varying,
    expiry_date timestamp without time zone,
    notional_value double precision,
    commission double precision DEFAULT 0,
    pnl double precision,
    unrealized_pnl double precision,
    trade_metadata json,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.trade OWNER TO postgres;

--
-- Name: trade_allocation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trade_allocation (
    allocation_id character varying NOT NULL,
    trade_id character varying,
    account_id character varying,
    alloc_qty integer,
    status character varying
);


ALTER TABLE public.trade_allocation OWNER TO postgres;

--
-- Name: trade_audit_trail; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trade_audit_trail (
    audit_id character varying NOT NULL,
    trade_id character varying NOT NULL,
    event_type character varying NOT NULL,
    event_description character varying,
    old_status character varying,
    new_status character varying,
    changed_by character varying,
    metadata jsonb,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.trade_audit_trail OWNER TO postgres;

--
-- Name: trade_hdr; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trade_hdr (
    trade_id character varying NOT NULL,
    order_id character varying,
    instrument_id character varying,
    side character varying,
    qty integer,
    price numeric,
    trader_id character varying,
    exec_time timestamp without time zone,
    broker_id character varying,
    account_id character varying,
    status character varying,
    reversal_of_trade_id character varying,
    roll_group_id character varying,
    created_at timestamp without time zone
);


ALTER TABLE public.trade_hdr OWNER TO postgres;

--
-- Name: trader; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trader (
    trader_id character varying NOT NULL,
    user_id character varying,
    name character varying,
    desk character varying,
    status character varying,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.trader OWNER TO postgres;

--
-- Name: trader_enrichment_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trader_enrichment_mapping (
    rule_id integer NOT NULL,
    source_system character varying NOT NULL,
    source_trader_uuid character varying NOT NULL,
    internal_trader_id character varying NOT NULL,
    email character varying NOT NULL,
    active character varying,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.trader_enrichment_mapping OWNER TO postgres;

--
-- Name: trader_enrichment_mapping_rule_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trader_enrichment_mapping_rule_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trader_enrichment_mapping_rule_id_seq OWNER TO postgres;

--
-- Name: trader_enrichment_mapping_rule_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trader_enrichment_mapping_rule_id_seq OWNED BY public.trader_enrichment_mapping.rule_id;


--
-- Name: user_role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_role (
    user_role_id character varying NOT NULL,
    user_id character varying NOT NULL,
    role_id character varying NOT NULL,
    assigned_at timestamp without time zone NOT NULL,
    assigned_by character varying,
    status character varying,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.user_role OWNER TO postgres;

--
-- Name: variation_margin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.variation_margin (
    vm_id character varying NOT NULL,
    instrument_id character varying,
    account_id character varying,
    val_date date,
    prev_settle numeric,
    today_settle numeric,
    net_qty integer,
    contract_multiplier integer,
    vm_amount numeric
);


ALTER TABLE public.variation_margin OWNER TO postgres;

--
-- Name: broker_enrichment_mapping rule_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.broker_enrichment_mapping ALTER COLUMN rule_id SET DEFAULT nextval('public.broker_enrichment_mapping_rule_id_seq'::regclass);


--
-- Name: clearer_enrichment_mapping rule_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clearer_enrichment_mapping ALTER COLUMN rule_id SET DEFAULT nextval('public.clearer_enrichment_mapping_rule_id_seq'::regclass);


--
-- Name: portfolio_enrichment_mapping rule_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolio_enrichment_mapping ALTER COLUMN rule_id SET DEFAULT nextval('public.portfolio_enrichment_mapping_rule_id_seq'::regclass);


--
-- Name: trader_enrichment_mapping rule_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trader_enrichment_mapping ALTER COLUMN rule_id SET DEFAULT nextval('public.trader_enrichment_mapping_rule_id_seq'::regclass);


--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.account (account_id, code, name, status, created_at, updated_at) FROM stdin;
a6e7a42b-5812-4b8a-99ec-7f5d2e8d441a	ACC002	Prop Trading Account	ACTIVE	2025-12-15 17:41:31.114261	\N
5d04efbc-0f1a-4f13-a992-831f9ec4f91f	ACC001	Main Trading Account	ACTIVE	2025-12-15 17:41:31.114236	2025-12-16 14:45:34.713749
\.


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alembic_version (version_num) FROM stdin;
add_trade_audit_trail
\.


--
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_log (audit_id, entity_type, entity_id, action, user_id, "timestamp", before_json, after_json, comment) FROM stdin;
\.


--
-- Data for Name: broker; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.broker (broker_id, code, name, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: broker_enrichment_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.broker_enrichment_mapping (rule_id, source_system, account_name, broker, broker_leid, comments, active, created_at) FROM stdin;
\.


--
-- Data for Name: clearer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clearer (clearer_id, code, name, leid, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: clearer_enrichment_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clearer_enrichment_mapping (rule_id, source_system, account_name, clearer, clearer_leid, comments, active, created_at) FROM stdin;
\.


--
-- Data for Name: counterparty; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.counterparty (counterparty_code, full_legal_name, short_name, customer_type, category, business_roles_json, country_of_incorporation, lei, registered_address_json, operational_address_json, tax_id, registration_number, primary_contact_json, secondary_contact_json, swift_bic, bank_details_json, settlement_instructions, default_settlement_account, parent_entity, counterparty_group, intercompany_group, relationship_type, credit_rating_agency, credit_rating, internal_risk_rating, counterparty_limit_amount, counterparty_limit_currency, limit_expiry_date, status, authorized, account_manager, created_by, created_at, updated_by, updated_at) FROM stdin;
\.


--
-- Data for Name: eod_pnl; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.eod_pnl (instrument_id, account_id, val_date, realized_pnl, unrealized_pnl, total_pnl) FROM stdin;
\.


--
-- Data for Name: final_settlement_price; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.final_settlement_price (instrument_id, val_date, final_price) FROM stdin;
\.


--
-- Data for Name: instrument; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instrument (instrument_id, symbol, name, asset_class, instrument_type, status, expiry_date, last_trading_date, created_at, metadata_json) FROM stdin;
43fb5465-4535-4064-bd5e-9eb81a2a9bf1	NQ	E-mini Nasdaq-100	EQUITY	FUTURES	ACTIVE	\N	\N	2025-12-15 17:41:31.11128	\N
25473d66-8d9a-4cb6-b084-54f1b1286c9a	AAPL	Apple Inc.	EQUITY	STOCK	ACTIVE	\N	\N	2025-12-15 17:41:45.239764	null
d2a9b71c-22c3-4c5e-881c-9db9e280717f	TSLA	Tesla Inc.	EQUITY	STOCK	ACTIVE	\N	\N	2025-12-15 17:45:13.648881	{"exchange": "NASDAQ", "currency": "USD", "sector": "Automotive", "tick_size": "0.01"}
a5e98fcd-7ca8-43e8-b77e-049b4c6f517c	GC	Gold Futures	COMMODITY	FUTURE	ACTIVE	\N	\N	2025-12-15 17:45:52.516048	{"exchange": "COMEX", "contract_size": "100", "tick_size": "0.10", "tick_value": "10.00", "currency": "USD"}
2a82ccc2-a897-4682-9674-e966fe04954b	EURUSD	EUR/USD Spot	FX	SPOT	ACTIVE	\N	\N	2025-12-15 17:46:00.366069	{"base_currency": "EUR", "quote_currency": "USD", "pip_size": "0.0001", "lot_size": "100000"}
3a0db4a8-e8f9-4b5c-9a50-61e4666f0eef	TEST	Test Instrument	EQUITY	STOCK	ACTIVE	\N	\N	2025-12-15 17:54:02.118488	null
23f366b6-3b25-46dd-bc59-a5ad52af8825	MSFT	Microsoft Corporation	EQUITY	STOCK	ACTIVE	\N	\N	2025-12-15 17:55:27.559361	null
FXFWD-EURUSD-001	EURUSD_FWD	EUR/USD FX Forward	FX	OTC_FX_FWD	ACTIVE	\N	\N	2025-12-16 03:27:13.520667	{"notional_currency": "EUR", "default_notional": 10000000, "counter_currency": "USD", "settlement_type": "CASH", "settlement_currency": "USD", "settlement_convention": "ACT/360_MODIFIED_FOLLOWING_TARGET", "pricing_model": "FX_FORWARD_IRPARITY", "booking_code": "OTC_FWD_EURUSD", "reporting_mic": "XOFF", "clearing": "BILATERAL", "confirmation_type": "ISDA_2002_FX"}
6E-FUT-CME-001	6E	CME Euro FX Futures	FX	FX_FUT	ACTIVE	\N	\N	2025-12-16 03:27:13.521096	{"root_symbol": "6E", "contract_size_eur": 125000, "price_quotation": "USD per EUR to 5 decimals", "tick_size": 5e-05, "tick_value": 6.25, "contract_months": ["MAR", "JUN", "SEP", "DEC"], "clearing_house": "CME Clearing", "trading_venue_mic": "XCME", "product_code": "FUT_EURUSD_CME_6E"}
STRAD-6E-ATM-001	6E-STRAD-ATM	Long ATM Straddle on 6E	FX	STRATEGY	ACTIVE	\N	\N	2025-12-16 03:27:13.521421	{"strategy_id": "STRAD-6E-ATM-001", "strategy_name": "Long ATM Straddle on Euro FX Futures", "legs": [{"leg_id": "STRAD-6E-ATM-001-CALL", "type": "OPTION_ON_FUTURES", "right": "CALL", "position": "LONG", "underlying": "6E", "strike": "ATM", "expiry": "MATCH_FUTURES_EXPIRY", "style": "EUROPEAN", "contract_multiplier": 125000}, {"leg_id": "STRAD-6E-ATM-001-PUT", "type": "OPTION_ON_FUTURES", "right": "PUT", "position": "LONG", "underlying": "6E", "strike": "ATM", "expiry": "MATCH_FUTURES_EXPIRY", "style": "EUROPEAN", "contract_multiplier": 125000}], "default_ratio": "1:1", "tradable_as_strategy": true, "strategy_code": "6E-STRAD-ATM", "quoting_convention": "NET_PREMIUM_USD_PER_CONTRACT"}
3daf6849-894c-48da-afd1-5ace584d26e9	ES	E-mini S&P 500	EQUITY	FUTURES	INACTIVE	\N	\N	2025-12-15 17:41:31.111234	\N
190310b3-1948-44fd-88eb-7f1a5d3aabab	TEST-EXPIRY-2	Test Instrument with Expiry 2	EQUITY	OPTION	ACTIVE	2026-12-31	2026-12-29	2025-12-16 13:35:59.709745	null
8e3794c3-492c-48ad-9e00-a51a79457e73	TEST-EXPIRY	Test Instrument with Expiry	EQUITY	OPTION	ACTIVE	2027-06-30	\N	2025-12-16 13:26:53.714975	null
\.


--
-- Data for Name: instrument_etd; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instrument_etd (instrument_id, exchange, exchange_code, mic_code, contract_size, contract_multiplier, tick_size, tick_value, contract_months, last_trade_day_rule, last_trade_date_of_year, margin_group, initial_margin, maintenance_margin, trading_hours, etd_details_json) FROM stdin;
\.


--
-- Data for Name: instrument_otc; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instrument_otc (instrument_id, forward_points_multiplier, settlement_type, settlement_day_offset, day_count_convention, payment_frequency, primary_calendar, secondary_calendar, is_cleared, clearing_house, clearing_code, bilateral_cpty, otc_details_json) FROM stdin;
\.


--
-- Data for Name: instrument_strategy; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instrument_strategy (instrument_id, strategy_template, payoff_type, rebalance_frequency, rebalance_threshold, pricing_model, valuation_currency, strategy_details_json) FROM stdin;
\.


--
-- Data for Name: module; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.module (module_id, module_name, description, status, created_at) FROM stdin;
MOD_ORDER_ENTRY	OrderEntry	Order Entry and Management	ACTIVE	2025-12-16 04:27:07.419638
MOD_STATIC_DATA	StaticData	Static Data Management	ACTIVE	2025-12-16 04:27:07.419677
MOD_MARKET_DATA	MarketData	Market Data Management	ACTIVE	2025-12-16 04:27:07.419705
MOD_ENRICHMENT	Enrichment	Enrichment Mappings	ACTIVE	2025-12-16 04:27:07.4198
MOD_TRADE	Trade	Trade Management	ACTIVE	2025-12-16 04:27:07.419993
MOD_CONFIRMATIONS	Confirmations	Confirmation Matching	ACTIVE	2025-12-16 04:27:07.420076
MOD_SETTLEMENTS	Settlements	Settlement Processing	ACTIVE	2025-12-16 04:27:07.42014
MOD_RISK	RiskManagement	Risk Controls and Monitoring	ACTIVE	2025-12-16 04:27:07.420189
MOD_SECURITY	Security	Security and Access Control	ACTIVE	2025-12-16 04:27:07.42036
\.


--
-- Data for Name: order_hdr; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_hdr (order_id, instrument_id, side, qty, limit_price, type, tif, trader_id, account_id, status, created_at) FROM stdin;
c298d73a-b74c-40e0-81f7-96283566cc1f	2a82ccc2-a897-4682-9674-e966fe04954b	BUY	1	1	LIMIT	DAY	d168e0c6-0cc2-49ec-81b1-484ffd4e24e5	5d04efbc-0f1a-4f13-a992-831f9ec4f91f	FILLED	2025-12-15 18:35:16.325343
5c8f61be-3310-4cfa-9460-49f25d73edf9	2a82ccc2-a897-4682-9674-e966fe04954b	BUY	1	1	LIMIT	DAY	d168e0c6-0cc2-49ec-81b1-484ffd4e24e5	5d04efbc-0f1a-4f13-a992-831f9ec4f91f	FILLED	2025-12-15 18:40:37.733093
f9252d66-037e-4a03-b270-9ce1a7492c11	3daf6849-894c-48da-afd1-5ace584d26e9	BUY	1	1	LIMIT	DAY	d168e0c6-0cc2-49ec-81b1-484ffd4e24e5	5d04efbc-0f1a-4f13-a992-831f9ec4f91f	FILLED	2025-12-16 03:32:40.866947
61bc74cd-6c6f-4af8-99c1-92abb7b3b55a	3daf6849-894c-48da-afd1-5ace584d26e9	BUY	1	1	LIMIT	DAY	d168e0c6-0cc2-49ec-81b1-484ffd4e24e5	5d04efbc-0f1a-4f13-a992-831f9ec4f91f	FILLED	2025-12-16 03:39:06.7758
e9c40559-3028-4747-8912-21819f43b70a	43fb5465-4535-4064-bd5e-9eb81a2a9bf1	BUY	1	1	LIMIT	DAY	d168e0c6-0cc2-49ec-81b1-484ffd4e24e5	5d04efbc-0f1a-4f13-a992-831f9ec4f91f	FILLED	2025-12-16 06:15:45.086665
268cfaf1-f39d-41cd-9317-2bdfeb1bb523	6E-FUT-CME-001	BUY	1	1.15	LIMIT	DAY	d168e0c6-0cc2-49ec-81b1-484ffd4e24e5	5d04efbc-0f1a-4f13-a992-831f9ec4f91f	FILLED	2025-12-16 10:36:41.215203
f7a1fbfe-7441-4727-9ea4-23ebdfd4680e	6E-FUT-CME-001	BUY	100	0.005	LIMIT	DAY	d168e0c6-0cc2-49ec-81b1-484ffd4e24e5	5d04efbc-0f1a-4f13-a992-831f9ec4f91f	NEW	2025-12-16 12:42:59.90936
c875d33c-c122-4387-9fcb-8419e08e54d0	6E-FUT-CME-001	BUY	100	0.005	LIMIT	DAY	d168e0c6-0cc2-49ec-81b1-484ffd4e24e5	5d04efbc-0f1a-4f13-a992-831f9ec4f91f	NEW	2025-12-16 12:42:59.9197
e4d415b1-9a0b-4608-8855-e35a613da47f	6E-FUT-CME-001	SELL	50	0.0075	LIMIT	GTC	d168e0c6-0cc2-49ec-81b1-484ffd4e24e5	5d04efbc-0f1a-4f13-a992-831f9ec4f91f	NEW	2025-12-16 12:46:45.039989
1bfb561a-14b0-4633-93a8-2d34f4e532bc	6E-FUT-CME-001	SELL	50	0.0035	LIMIT	GTC	d168e0c6-0cc2-49ec-81b1-484ffd4e24e5	5d04efbc-0f1a-4f13-a992-831f9ec4f91f	NEW	2025-12-16 12:46:45.047247
\.


--
-- Data for Name: permission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permission (permission_id, permission_name, description, status, created_at) FROM stdin;
PERM_READ	READ	Read-only access	ACTIVE	2025-12-16 04:27:07.419488
PERM_READ_WRITE	READ_WRITE	Read and Write access	ACTIVE	2025-12-16 04:27:07.419563
PERM_NONE	NONE	No access	ACTIVE	2025-12-16 04:27:07.419606
\.


--
-- Data for Name: portfolio_enrichment_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.portfolio_enrichment_mapping (rule_id, source_system, trader_id, account_id, instrument_code, portfolio, comments, active, created_at) FROM stdin;
1	BLBG	d168e0c6-0cc2-49ec-81b1-484ffd4e24e5	5d04efbc-0f1a-4f13-a992-831f9ec4f91f		FX Options Portfolio	Sample mapping for testing	Y	2025-12-16 15:20:41.368855
\.


--
-- Data for Name: position_daily; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.position_daily (instrument_id, account_id, val_date, net_qty, open_qty, close_qty) FROM stdin;
\.


--
-- Data for Name: role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role (role_id, role_name, description, status, created_at) FROM stdin;
ROLE_ADMIN	ADMIN	System Administrator - Full access to all modules and security management	ACTIVE	2025-12-16 04:27:07.419316
ROLE_VIEWER	VIEWER	Viewer - Read-only access to all modules	ACTIVE	2025-12-16 04:27:07.419429
\.


--
-- Data for Name: role_permission_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permission_mapping (mapping_id, role_id, module_id, permission_id, status, created_at) FROM stdin;
MAP_001	ROLE_ADMIN	MOD_ORDER_ENTRY	PERM_READ_WRITE	ACTIVE	2025-12-16 04:27:07.424929
MAP_002	ROLE_ADMIN	MOD_STATIC_DATA	PERM_READ_WRITE	ACTIVE	2025-12-16 04:27:07.425012
MAP_003	ROLE_ADMIN	MOD_MARKET_DATA	PERM_READ_WRITE	ACTIVE	2025-12-16 04:27:07.425041
MAP_004	ROLE_ADMIN	MOD_ENRICHMENT	PERM_READ_WRITE	ACTIVE	2025-12-16 04:27:07.425081
MAP_005	ROLE_ADMIN	MOD_TRADE	PERM_READ_WRITE	ACTIVE	2025-12-16 04:27:07.425117
MAP_006	ROLE_ADMIN	MOD_CONFIRMATIONS	PERM_READ_WRITE	ACTIVE	2025-12-16 04:27:07.425151
MAP_007	ROLE_ADMIN	MOD_SETTLEMENTS	PERM_READ_WRITE	ACTIVE	2025-12-16 04:27:07.42519
MAP_008	ROLE_ADMIN	MOD_RISK	PERM_READ_WRITE	ACTIVE	2025-12-16 04:27:07.425223
MAP_009	ROLE_ADMIN	MOD_SECURITY	PERM_READ_WRITE	ACTIVE	2025-12-16 04:27:07.425261
MAP_010	ROLE_VIEWER	MOD_ORDER_ENTRY	PERM_READ	ACTIVE	2025-12-16 04:27:07.425421
MAP_011	ROLE_VIEWER	MOD_TRADE	PERM_READ	ACTIVE	2025-12-16 04:27:07.425466
MAP_012	ROLE_VIEWER	MOD_STATIC_DATA	PERM_READ	ACTIVE	2025-12-16 04:27:07.425503
MAP_013	ROLE_VIEWER	MOD_MARKET_DATA	PERM_READ	ACTIVE	2025-12-16 04:27:07.425548
MAP_014	ROLE_VIEWER	MOD_ENRICHMENT	PERM_READ	ACTIVE	2025-12-16 04:27:07.425591
MAP_015	ROLE_VIEWER	MOD_CONFIRMATIONS	PERM_READ	ACTIVE	2025-12-16 04:27:07.425616
MAP_016	ROLE_VIEWER	MOD_SETTLEMENTS	PERM_READ	ACTIVE	2025-12-16 04:27:07.425638
MAP_017	ROLE_VIEWER	MOD_RISK	PERM_READ	ACTIVE	2025-12-16 04:27:07.425681
MAP_018	ROLE_VIEWER	MOD_SECURITY	PERM_NONE	ACTIVE	2025-12-16 04:27:07.42571
\.


--
-- Data for Name: settlement_price; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settlement_price (instrument_id, val_date, settle_price) FROM stdin;
\.


--
-- Data for Name: strategy_leg; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.strategy_leg (leg_id, strategy_id, component_instrument_id, leg_sequence, side, ratio, quantity_type, hedge_ratio, leg_details_json, status, created_at) FROM stdin;
\.


--
-- Data for Name: trade; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trade (trade_id, order_id, instrument_id, side, qty, price, exec_time, trader_id, broker_id, account_id, status, cancellation_reason, expiry_date, notional_value, commission, pnl, unrealized_pnl, trade_metadata, created_at, updated_at) FROM stdin;
a68f911b-962a-4784-b221-43453ce64319	\N	43fb5465-4535-4064-bd5e-9eb81a2a9bf1	BUY	100	150.5	2025-12-16 14:43:39.003733	d168e0c6-0cc2-49ec-81b1-484ffd4e24e5	\N	5d04efbc-0f1a-4f13-a992-831f9ec4f91f	CANCELLED	User requested	\N	15050	0	\N	\N	\N	2025-12-16 14:43:39.003734	2025-12-16 14:43:53.309501
7e296249-303a-4656-abe8-253808ecc815	\N	190310b3-1948-44fd-88eb-7f1a5d3aabab	SELL	50	200.75	2025-12-16 16:09:52.236581	d168e0c6-0cc2-49ec-81b1-484ffd4e24e5	\N	5d04efbc-0f1a-4f13-a992-831f9ec4f91f	EXPIRED	\N	\N	10037.5	0	\N	\N	\N	2025-12-16 16:09:52.236583	2025-12-16 16:34:04.634271
\.


--
-- Data for Name: trade_allocation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trade_allocation (allocation_id, trade_id, account_id, alloc_qty, status) FROM stdin;
\.


--
-- Data for Name: trade_audit_trail; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trade_audit_trail (audit_id, trade_id, event_type, event_description, old_status, new_status, changed_by, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: trade_hdr; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trade_hdr (trade_id, order_id, instrument_id, side, qty, price, trader_id, exec_time, broker_id, account_id, status, reversal_of_trade_id, roll_group_id, created_at) FROM stdin;
\.


--
-- Data for Name: trader; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trader (trader_id, user_id, name, desk, status, created_at, updated_at) FROM stdin;
d168e0c6-0cc2-49ec-81b1-484ffd4e24e5	TRADER001	John Doe	Equity Desk	ACTIVE	2025-12-15 17:41:31.112597	\N
9576efbf-032e-4e26-8f4f-11411ccca2d3	TRADER002	Jane Smith	FX Desk	ACTIVE	2025-12-15 17:41:31.112642	\N
\.


--
-- Data for Name: trader_enrichment_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trader_enrichment_mapping (rule_id, source_system, source_trader_uuid, internal_trader_id, email, active, created_at) FROM stdin;
\.


--
-- Data for Name: user_role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_role (user_role_id, user_id, role_id, assigned_at, assigned_by, status, created_at) FROM stdin;
\.


--
-- Data for Name: variation_margin; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.variation_margin (vm_id, instrument_id, account_id, val_date, prev_settle, today_settle, net_qty, contract_multiplier, vm_amount) FROM stdin;
\.


--
-- Name: broker_enrichment_mapping_rule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.broker_enrichment_mapping_rule_id_seq', 1, false);


--
-- Name: clearer_enrichment_mapping_rule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clearer_enrichment_mapping_rule_id_seq', 1, false);


--
-- Name: portfolio_enrichment_mapping_rule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.portfolio_enrichment_mapping_rule_id_seq', 1, false);


--
-- Name: trader_enrichment_mapping_rule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trader_enrichment_mapping_rule_id_seq', 1, false);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (account_id);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (audit_id);


--
-- Name: broker_enrichment_mapping broker_enrichment_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.broker_enrichment_mapping
    ADD CONSTRAINT broker_enrichment_mapping_pkey PRIMARY KEY (rule_id);


--
-- Name: broker broker_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.broker
    ADD CONSTRAINT broker_pkey PRIMARY KEY (broker_id);


--
-- Name: clearer_enrichment_mapping clearer_enrichment_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clearer_enrichment_mapping
    ADD CONSTRAINT clearer_enrichment_mapping_pkey PRIMARY KEY (rule_id);


--
-- Name: clearer clearer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clearer
    ADD CONSTRAINT clearer_pkey PRIMARY KEY (clearer_id);


--
-- Name: counterparty counterparty_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.counterparty
    ADD CONSTRAINT counterparty_pkey PRIMARY KEY (counterparty_code);


--
-- Name: eod_pnl eod_pnl_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eod_pnl
    ADD CONSTRAINT eod_pnl_pkey PRIMARY KEY (instrument_id, account_id, val_date);


--
-- Name: final_settlement_price final_settlement_price_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.final_settlement_price
    ADD CONSTRAINT final_settlement_price_pkey PRIMARY KEY (instrument_id, val_date);


--
-- Name: instrument_etd instrument_etd_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instrument_etd
    ADD CONSTRAINT instrument_etd_pkey PRIMARY KEY (instrument_id);


--
-- Name: instrument_otc instrument_otc_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instrument_otc
    ADD CONSTRAINT instrument_otc_pkey PRIMARY KEY (instrument_id);


--
-- Name: instrument instrument_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instrument
    ADD CONSTRAINT instrument_pkey PRIMARY KEY (instrument_id);


--
-- Name: instrument_strategy instrument_strategy_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instrument_strategy
    ADD CONSTRAINT instrument_strategy_pkey PRIMARY KEY (instrument_id);


--
-- Name: module module_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.module
    ADD CONSTRAINT module_pkey PRIMARY KEY (module_id);


--
-- Name: order_hdr order_hdr_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_hdr
    ADD CONSTRAINT order_hdr_pkey PRIMARY KEY (order_id);


--
-- Name: permission permission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission
    ADD CONSTRAINT permission_pkey PRIMARY KEY (permission_id);


--
-- Name: portfolio_enrichment_mapping portfolio_enrichment_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.portfolio_enrichment_mapping
    ADD CONSTRAINT portfolio_enrichment_mapping_pkey PRIMARY KEY (rule_id);


--
-- Name: position_daily position_daily_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.position_daily
    ADD CONSTRAINT position_daily_pkey PRIMARY KEY (instrument_id, account_id, val_date);


--
-- Name: role_permission_mapping role_permission_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permission_mapping
    ADD CONSTRAINT role_permission_mapping_pkey PRIMARY KEY (mapping_id);


--
-- Name: role role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_pkey PRIMARY KEY (role_id);


--
-- Name: settlement_price settlement_price_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settlement_price
    ADD CONSTRAINT settlement_price_pkey PRIMARY KEY (instrument_id, val_date);


--
-- Name: strategy_leg strategy_leg_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strategy_leg
    ADD CONSTRAINT strategy_leg_pkey PRIMARY KEY (leg_id);


--
-- Name: trade_allocation trade_allocation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trade_allocation
    ADD CONSTRAINT trade_allocation_pkey PRIMARY KEY (allocation_id);


--
-- Name: trade_audit_trail trade_audit_trail_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trade_audit_trail
    ADD CONSTRAINT trade_audit_trail_pkey PRIMARY KEY (audit_id);


--
-- Name: trade_hdr trade_hdr_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trade_hdr
    ADD CONSTRAINT trade_hdr_pkey PRIMARY KEY (trade_id);


--
-- Name: trade trade_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trade
    ADD CONSTRAINT trade_pkey PRIMARY KEY (trade_id);


--
-- Name: trader_enrichment_mapping trader_enrichment_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trader_enrichment_mapping
    ADD CONSTRAINT trader_enrichment_mapping_pkey PRIMARY KEY (rule_id);


--
-- Name: trader trader_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trader
    ADD CONSTRAINT trader_pkey PRIMARY KEY (trader_id);


--
-- Name: user_role user_role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT user_role_pkey PRIMARY KEY (user_role_id);


--
-- Name: variation_margin variation_margin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variation_margin
    ADD CONSTRAINT variation_margin_pkey PRIMARY KEY (vm_id);


--
-- Name: ix_account_account_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_account_account_id ON public.account USING btree (account_id);


--
-- Name: ix_audit_log_audit_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_audit_log_audit_id ON public.audit_log USING btree (audit_id);


--
-- Name: ix_broker_broker_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_broker_broker_id ON public.broker USING btree (broker_id);


--
-- Name: ix_broker_enrichment_mapping_account_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_broker_enrichment_mapping_account_name ON public.broker_enrichment_mapping USING btree (account_name);


--
-- Name: ix_broker_enrichment_mapping_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_broker_enrichment_mapping_active ON public.broker_enrichment_mapping USING btree (active);


--
-- Name: ix_broker_enrichment_mapping_rule_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_broker_enrichment_mapping_rule_id ON public.broker_enrichment_mapping USING btree (rule_id);


--
-- Name: ix_broker_enrichment_mapping_source_system; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_broker_enrichment_mapping_source_system ON public.broker_enrichment_mapping USING btree (source_system);


--
-- Name: ix_clearer_clearer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_clearer_clearer_id ON public.clearer USING btree (clearer_id);


--
-- Name: ix_clearer_enrichment_mapping_account_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_clearer_enrichment_mapping_account_name ON public.clearer_enrichment_mapping USING btree (account_name);


--
-- Name: ix_clearer_enrichment_mapping_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_clearer_enrichment_mapping_active ON public.clearer_enrichment_mapping USING btree (active);


--
-- Name: ix_clearer_enrichment_mapping_rule_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_clearer_enrichment_mapping_rule_id ON public.clearer_enrichment_mapping USING btree (rule_id);


--
-- Name: ix_clearer_enrichment_mapping_source_system; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_clearer_enrichment_mapping_source_system ON public.clearer_enrichment_mapping USING btree (source_system);


--
-- Name: ix_counterparty_counterparty_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_counterparty_counterparty_code ON public.counterparty USING btree (counterparty_code);


--
-- Name: ix_instrument_instrument_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_instrument_instrument_id ON public.instrument USING btree (instrument_id);


--
-- Name: ix_instrument_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_instrument_status ON public.instrument USING btree (status);


--
-- Name: ix_instrument_symbol; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_instrument_symbol ON public.instrument USING btree (symbol);


--
-- Name: ix_module_module_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_module_module_id ON public.module USING btree (module_id);


--
-- Name: ix_module_module_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_module_module_name ON public.module USING btree (module_name);


--
-- Name: ix_module_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_module_status ON public.module USING btree (status);


--
-- Name: ix_order_hdr_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_order_hdr_order_id ON public.order_hdr USING btree (order_id);


--
-- Name: ix_permission_permission_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_permission_permission_id ON public.permission USING btree (permission_id);


--
-- Name: ix_permission_permission_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_permission_permission_name ON public.permission USING btree (permission_name);


--
-- Name: ix_permission_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_permission_status ON public.permission USING btree (status);


--
-- Name: ix_portfolio_enrichment_mapping_account_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_portfolio_enrichment_mapping_account_id ON public.portfolio_enrichment_mapping USING btree (account_id);


--
-- Name: ix_portfolio_enrichment_mapping_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_portfolio_enrichment_mapping_active ON public.portfolio_enrichment_mapping USING btree (active);


--
-- Name: ix_portfolio_enrichment_mapping_rule_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_portfolio_enrichment_mapping_rule_id ON public.portfolio_enrichment_mapping USING btree (rule_id);


--
-- Name: ix_portfolio_enrichment_mapping_source_system; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_portfolio_enrichment_mapping_source_system ON public.portfolio_enrichment_mapping USING btree (source_system);


--
-- Name: ix_portfolio_enrichment_mapping_trader_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_portfolio_enrichment_mapping_trader_id ON public.portfolio_enrichment_mapping USING btree (trader_id);


--
-- Name: ix_role_permission_mapping_mapping_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_role_permission_mapping_mapping_id ON public.role_permission_mapping USING btree (mapping_id);


--
-- Name: ix_role_permission_mapping_module_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_role_permission_mapping_module_id ON public.role_permission_mapping USING btree (module_id);


--
-- Name: ix_role_permission_mapping_permission_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_role_permission_mapping_permission_id ON public.role_permission_mapping USING btree (permission_id);


--
-- Name: ix_role_permission_mapping_role_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_role_permission_mapping_role_id ON public.role_permission_mapping USING btree (role_id);


--
-- Name: ix_role_permission_mapping_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_role_permission_mapping_status ON public.role_permission_mapping USING btree (status);


--
-- Name: ix_role_role_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_role_role_id ON public.role USING btree (role_id);


--
-- Name: ix_role_role_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_role_role_name ON public.role USING btree (role_name);


--
-- Name: ix_role_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_role_status ON public.role USING btree (status);


--
-- Name: ix_strategy_leg_component_instrument_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_strategy_leg_component_instrument_id ON public.strategy_leg USING btree (component_instrument_id);


--
-- Name: ix_strategy_leg_leg_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_strategy_leg_leg_id ON public.strategy_leg USING btree (leg_id);


--
-- Name: ix_strategy_leg_strategy_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_strategy_leg_strategy_id ON public.strategy_leg USING btree (strategy_id);


--
-- Name: ix_trade_allocation_allocation_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_trade_allocation_allocation_id ON public.trade_allocation USING btree (allocation_id);


--
-- Name: ix_trade_audit_trail_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_trade_audit_trail_created_at ON public.trade_audit_trail USING btree (created_at);


--
-- Name: ix_trade_audit_trail_trade_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_trade_audit_trail_trade_id ON public.trade_audit_trail USING btree (trade_id);


--
-- Name: ix_trade_hdr_trade_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_trade_hdr_trade_id ON public.trade_hdr USING btree (trade_id);


--
-- Name: ix_trade_trade_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_trade_trade_id ON public.trade USING btree (trade_id);


--
-- Name: ix_trader_enrichment_mapping_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_trader_enrichment_mapping_active ON public.trader_enrichment_mapping USING btree (active);


--
-- Name: ix_trader_enrichment_mapping_internal_trader_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_trader_enrichment_mapping_internal_trader_id ON public.trader_enrichment_mapping USING btree (internal_trader_id);


--
-- Name: ix_trader_enrichment_mapping_rule_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_trader_enrichment_mapping_rule_id ON public.trader_enrichment_mapping USING btree (rule_id);


--
-- Name: ix_trader_enrichment_mapping_source_system; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_trader_enrichment_mapping_source_system ON public.trader_enrichment_mapping USING btree (source_system);


--
-- Name: ix_trader_enrichment_mapping_source_trader_uuid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_trader_enrichment_mapping_source_trader_uuid ON public.trader_enrichment_mapping USING btree (source_trader_uuid);


--
-- Name: ix_trader_trader_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_trader_trader_id ON public.trader USING btree (trader_id);


--
-- Name: ix_user_role_role_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_user_role_role_id ON public.user_role USING btree (role_id);


--
-- Name: ix_user_role_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_user_role_status ON public.user_role USING btree (status);


--
-- Name: ix_user_role_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_user_role_user_id ON public.user_role USING btree (user_id);


--
-- Name: ix_user_role_user_role_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_user_role_user_role_id ON public.user_role USING btree (user_role_id);


--
-- Name: ix_variation_margin_vm_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_variation_margin_vm_id ON public.variation_margin USING btree (vm_id);


--
-- Name: eod_pnl eod_pnl_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eod_pnl
    ADD CONSTRAINT eod_pnl_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(account_id);


--
-- Name: eod_pnl eod_pnl_instrument_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eod_pnl
    ADD CONSTRAINT eod_pnl_instrument_id_fkey FOREIGN KEY (instrument_id) REFERENCES public.instrument(instrument_id);


--
-- Name: final_settlement_price final_settlement_price_instrument_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.final_settlement_price
    ADD CONSTRAINT final_settlement_price_instrument_id_fkey FOREIGN KEY (instrument_id) REFERENCES public.instrument(instrument_id);


--
-- Name: instrument_etd instrument_etd_instrument_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instrument_etd
    ADD CONSTRAINT instrument_etd_instrument_id_fkey FOREIGN KEY (instrument_id) REFERENCES public.instrument(instrument_id);


--
-- Name: instrument_otc instrument_otc_instrument_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instrument_otc
    ADD CONSTRAINT instrument_otc_instrument_id_fkey FOREIGN KEY (instrument_id) REFERENCES public.instrument(instrument_id);


--
-- Name: instrument_strategy instrument_strategy_instrument_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instrument_strategy
    ADD CONSTRAINT instrument_strategy_instrument_id_fkey FOREIGN KEY (instrument_id) REFERENCES public.instrument(instrument_id);


--
-- Name: order_hdr order_hdr_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_hdr
    ADD CONSTRAINT order_hdr_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(account_id);


--
-- Name: order_hdr order_hdr_instrument_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_hdr
    ADD CONSTRAINT order_hdr_instrument_id_fkey FOREIGN KEY (instrument_id) REFERENCES public.instrument(instrument_id);


--
-- Name: order_hdr order_hdr_trader_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_hdr
    ADD CONSTRAINT order_hdr_trader_id_fkey FOREIGN KEY (trader_id) REFERENCES public.trader(trader_id);


--
-- Name: position_daily position_daily_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.position_daily
    ADD CONSTRAINT position_daily_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(account_id);


--
-- Name: position_daily position_daily_instrument_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.position_daily
    ADD CONSTRAINT position_daily_instrument_id_fkey FOREIGN KEY (instrument_id) REFERENCES public.instrument(instrument_id);


--
-- Name: role_permission_mapping role_permission_mapping_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permission_mapping
    ADD CONSTRAINT role_permission_mapping_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.module(module_id);


--
-- Name: role_permission_mapping role_permission_mapping_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permission_mapping
    ADD CONSTRAINT role_permission_mapping_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permission(permission_id);


--
-- Name: role_permission_mapping role_permission_mapping_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permission_mapping
    ADD CONSTRAINT role_permission_mapping_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.role(role_id);


--
-- Name: settlement_price settlement_price_instrument_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settlement_price
    ADD CONSTRAINT settlement_price_instrument_id_fkey FOREIGN KEY (instrument_id) REFERENCES public.instrument(instrument_id);


--
-- Name: strategy_leg strategy_leg_component_instrument_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strategy_leg
    ADD CONSTRAINT strategy_leg_component_instrument_id_fkey FOREIGN KEY (component_instrument_id) REFERENCES public.instrument(instrument_id);


--
-- Name: strategy_leg strategy_leg_strategy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.strategy_leg
    ADD CONSTRAINT strategy_leg_strategy_id_fkey FOREIGN KEY (strategy_id) REFERENCES public.instrument(instrument_id);


--
-- Name: trade trade_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trade
    ADD CONSTRAINT trade_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(account_id);


--
-- Name: trade_allocation trade_allocation_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trade_allocation
    ADD CONSTRAINT trade_allocation_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(account_id);


--
-- Name: trade_allocation trade_allocation_trade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trade_allocation
    ADD CONSTRAINT trade_allocation_trade_id_fkey FOREIGN KEY (trade_id) REFERENCES public.trade_hdr(trade_id);


--
-- Name: trade trade_broker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trade
    ADD CONSTRAINT trade_broker_id_fkey FOREIGN KEY (broker_id) REFERENCES public.broker(broker_id);


--
-- Name: trade_hdr trade_hdr_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trade_hdr
    ADD CONSTRAINT trade_hdr_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(account_id);


--
-- Name: trade_hdr trade_hdr_broker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trade_hdr
    ADD CONSTRAINT trade_hdr_broker_id_fkey FOREIGN KEY (broker_id) REFERENCES public.broker(broker_id);


--
-- Name: trade_hdr trade_hdr_instrument_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trade_hdr
    ADD CONSTRAINT trade_hdr_instrument_id_fkey FOREIGN KEY (instrument_id) REFERENCES public.instrument(instrument_id);


--
-- Name: trade_hdr trade_hdr_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trade_hdr
    ADD CONSTRAINT trade_hdr_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.order_hdr(order_id);


--
-- Name: trade_hdr trade_hdr_trader_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trade_hdr
    ADD CONSTRAINT trade_hdr_trader_id_fkey FOREIGN KEY (trader_id) REFERENCES public.trader(trader_id);


--
-- Name: trade trade_instrument_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trade
    ADD CONSTRAINT trade_instrument_id_fkey FOREIGN KEY (instrument_id) REFERENCES public.instrument(instrument_id);


--
-- Name: trade trade_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trade
    ADD CONSTRAINT trade_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.order_hdr(order_id);


--
-- Name: trade trade_trader_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trade
    ADD CONSTRAINT trade_trader_id_fkey FOREIGN KEY (trader_id) REFERENCES public.trader(trader_id);


--
-- Name: user_role user_role_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT user_role_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.role(role_id);


--
-- Name: user_role user_role_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT user_role_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.trader(trader_id);


--
-- Name: variation_margin variation_margin_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variation_margin
    ADD CONSTRAINT variation_margin_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.account(account_id);


--
-- Name: variation_margin variation_margin_instrument_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variation_margin
    ADD CONSTRAINT variation_margin_instrument_id_fkey FOREIGN KEY (instrument_id) REFERENCES public.instrument(instrument_id);


--
-- PostgreSQL database dump complete
--

\unrestrict Jpm8PkNbNbPhyZeJTRUfUsznfiKI7PdnOnacPQdnT8ptlzQh9T5NU3DdwqBrU9Y

