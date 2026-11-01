-- Run as SYSTEM / SYS against your pluggable DB (e.g. XEPDB1). Tables are created by Hibernate on first start.
ACCEPT venuevista_password CHAR PROMPT 'Enter password for VENUEVISTA: ' HIDE
CREATE USER venuevista IDENTIFIED BY "&&venuevista_password" DEFAULT TABLESPACE users QUOTA UNLIMITED ON users;
GRANT CONNECT, RESOURCE, CREATE VIEW TO venuevista;
UNDEFINE venuevista_password
