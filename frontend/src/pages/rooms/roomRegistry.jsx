import React from "react";
import {
  Layers, Hash, Activity, Globe, Router,
  Search, Bug, Target, ShieldCheck,
  Code, Lock, Server, BookOpen, Download, Database, Shield, Unlock, Terminal, Folder,
  Key, UserCheck, Repeat, Cookie, Users, Mail, Package, FileJson, AlertTriangle, CircuitBoard, Binary, Cpu, Box
} from "lucide-react";
import {
  OsiModelAnimation, RoutingAnimation,
  RequestFlowAnimation, ScanningAnimation, ExploitAnimation, DefenseAnimation,
  ApiFlowAnimation, JsonParserAnimation, SqliAnimation, LinuxAnimation, AuthAnimation, OsintAnimation, PickleAnimation, CryptoAnimation, ReAnimation
} from "../../components/rooms/RoomAnimations";
import { NETWORKING_ROOM_DATA, NETWORKING_BADGES, NETWORKING_QUIZ } from "./room_data/networking";
import { PENTESTING_ROOM_DATA, PENTESTING_BADGES, PENTESTING_QUIZ } from "./room_data/pentesting";
import { REST_API_ROOM_DATA, REST_API_BADGES, REST_API_QUIZ } from "./room_data/restApi";
import { SQLI_ROOM_DATA, SQLI_BADGES, SQLI_QUIZ } from "./room_data/sqli";
import { LINUX_ROOM_DATA, LINUX_BADGES, LINUX_QUIZ } from "./room_data/linux";
import { AUTH_ROOM_DATA, AUTH_QUIZ } from "./room_data/auth";
import { OSINT_ROOM_DATA, OSINT_BADGES, OSINT_QUIZ } from "./room_data/osint";
import { PICKLE_ROOM_DATA, PICKLE_BADGES, PICKLE_QUIZ } from "./room_data/pickle";
import { CRYPTO_ROOM_DATA, CRYPTO_BADGES, CRYPTO_QUIZ } from "./room_data/crypto";
import { RE_ROOM_DATA, RE_BADGES, RE_QUIZ } from "./room_data/re";

const ICON_SETS = {
  networking: {
    layers: <Layers size={18} />, hash: <Hash size={18} />, activity: <Activity size={18} />,
    globe: <Globe size={18} />, router: <Router size={18} />,
  },
  pentesting: {
    globe: <Globe size={18} />, search: <Search size={18} />, bug: <Bug size={18} />,
    target: <Target size={18} />, shield: <ShieldCheck size={18} />,
  },
  restapi: {
    globe: <Globe size={18} />, activity: <Activity size={18} />, code: <Code size={18} />,
    lock: <Lock size={18} />, server: <Server size={18} />,
  },
  sqli: {
    database: <Database size={18} />, unlock: <Unlock size={18} />,
    download: <Download size={18} />, shield: <Shield size={18} />,
  },
  linux: {
    terminal: <Terminal size={18} />, folder: <Folder size={18} />,
    lock: <Lock size={18} />, search: <Search size={18} />,
    activity: <Activity size={18} />,
  },
  auth: {
    key: <Key size={18} />, user: <UserCheck size={18} />,
    shield: <ShieldCheck size={18} />, repeat: <Repeat size={18} />,
    cookie: <Cookie size={18} />,
  },
  osint: {
    search: <Search size={18} />, globe: <Globe size={18} />, users: <Users size={18} />,
    mail: <Mail size={18} />, tool: <Terminal size={18} />,
  },
  pickle: {
    package: <Package size={18} />, alert: <AlertTriangle size={18} />, code: <Code size={18} />,
    terminal: <Terminal size={18} />, shield: <ShieldCheck size={18} />,
  },
  crypto: {
    lock: <Lock size={18} />, code: <Code size={18} />, hash: <Hash size={18} />,
    unlock: <Unlock size={18} />, key: <Key size={18} />,
  },
  re: {
    cpu: <Cpu size={18} />, box: <Box size={18} />, search: <Search size={18} />,
    activity: <Activity size={18} />, unlock: <Unlock size={18} />,
  },
};

const makeGetIcon = (set) => (name) => ICON_SETS[set][name] || <BookOpen size={18} />;

const ANIMATIONS = {
  networking: (taskId) => {
    if (taskId === 1 || taskId === 3) return <OsiModelAnimation />;
    return <RoutingAnimation />;
  },
  pentesting: (taskId) => {
    if (taskId === 1) return <RequestFlowAnimation />;
    if (taskId === 2) return <ScanningAnimation />;
    if (taskId === 3 || taskId === 4) return <ExploitAnimation />;
    if (taskId === 5) return <DefenseAnimation />;
    return null;
  },
  restapi: (taskId) => {
    if (taskId === 1 || taskId === 2 || taskId === 4) return <ApiFlowAnimation />;
    return <JsonParserAnimation />;
  },
  sqli: (taskId) => {
    return <SqliAnimation taskId={taskId} />;
  },
  linux: (taskId) => {
    return <LinuxAnimation taskId={taskId} />;
  },
  auth: (taskId) => {
    return <AuthAnimation taskId={taskId} />;
  },
  osint: (taskId) => {
    return <OsintAnimation taskId={taskId} />;
  },
  pickle: (taskId) => {
    return <PickleAnimation taskId={taskId} />;
  },
  crypto: (taskId) => {
    return <CryptoAnimation taskId={taskId} />;
  },
  re: (taskId) => {
    return <ReAnimation taskId={taskId} />;
  },
};

const ROOM_REGISTRY = {
  "networking-fundamentals": {
    data: NETWORKING_ROOM_DATA,
    badges: NETWORKING_BADGES,
    quiz: NETWORKING_QUIZ,
    getAnimation: ANIMATIONS.networking,
    getIcon: makeGetIcon("networking"),
  },
  "web-app-pentesting": {
    data: PENTESTING_ROOM_DATA,
    badges: PENTESTING_BADGES,
    quiz: PENTESTING_QUIZ,
    getAnimation: ANIMATIONS.pentesting,
    getIcon: makeGetIcon("pentesting"),
  },
  "rest-api-mastery": {
    data: REST_API_ROOM_DATA,
    badges: REST_API_BADGES,
    quiz: REST_API_QUIZ,
    getAnimation: ANIMATIONS.restapi,
    getIcon: makeGetIcon("restapi"),
  },
  "sql-injection-fundamentals": {
    data: SQLI_ROOM_DATA,
    badges: SQLI_BADGES,
    quiz: SQLI_QUIZ,
    getAnimation: ANIMATIONS.sqli,
    getIcon: makeGetIcon("sqli"),
  },
  "linux-fundamentals": {
    data: LINUX_ROOM_DATA,
    badges: LINUX_BADGES,
    quiz: LINUX_QUIZ,
    getAnimation: ANIMATIONS.linux,
    getIcon: makeGetIcon("linux"),
  },
  "authentication-session-attacks": {
    data: AUTH_ROOM_DATA,
    quiz: AUTH_QUIZ,
    getAnimation: ANIMATIONS.auth,
    getIcon: makeGetIcon("auth"),
  },
  "osint-investigation": {
    data: OSINT_ROOM_DATA,
    badges: OSINT_BADGES,
    quiz: OSINT_QUIZ,
    getAnimation: ANIMATIONS.osint,
    getIcon: makeGetIcon("osint"),
  },
  "python-pickle-deserialization": {
    data: PICKLE_ROOM_DATA,
    badges: PICKLE_BADGES,
    quiz: PICKLE_QUIZ,
    getAnimation: ANIMATIONS.pickle,
    getIcon: makeGetIcon("pickle"),
  },
  "cryptography-basics": {
    data: CRYPTO_ROOM_DATA,
    badges: CRYPTO_BADGES,
    quiz: CRYPTO_QUIZ,
    getAnimation: ANIMATIONS.crypto,
    getIcon: makeGetIcon("crypto"),
  },
  "reverse-engineering-basics": {
    data: RE_ROOM_DATA,
    badges: RE_BADGES,
    quiz: RE_QUIZ,
    getAnimation: ANIMATIONS.re,
    getIcon: makeGetIcon("re"),
  },
};

export default ROOM_REGISTRY;
