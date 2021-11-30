create database private_cloud;
use private_cloud;

create table file (
id bigint unsigned not null auto_increment,
file_size bigint unsigned not null default 0 comment '文件大小',
file_md5 char(32) not null default '' comment '文件md5',
file_name varchar(128) not null default '' comment '文件名称',
file_type varchar(32) not null default '' comment '文件类型，如 image/jpg，image/png',
file_time bigint unsigned not null default 0 comment '原文件创建时间',
client_type tinyint unsigned not null default 0 comment '客户端类型，0：unknown，1：h5，2：android，3：ios，4：pc',
server_path varchar(255) not null default '' comment '服务器存储路径',
origin_path varchar(255) not null default '' comment '客户端原路径',
thumb_path varchar(128) not null default '' comment '缩略图路径',
create_time bigint unsigned not null default 0 comment '创建时间',
delete_time bigint unsigned not null default 0 comment '删除时间',
primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 comment '文件表';

create table tmp_file (
id bigint unsigned not null auto_increment,
file_size bigint unsigned not null default 0 comment '文件大小',
file_md5 char(32) not null default '' comment '文件md5',
file_name varchar(128) not null default '' comment '文件名称',
file_type varchar(32) not null default '' comment '文件类型，如 image/jpg，image/png',
file_time bigint unsigned not null default 0 comment '原文件创建时间',
client_type tinyint unsigned not null default 0 comment '客户端类型，0：unknown，1：h5，2：android，3：ios，4：pc',
state tinyint unsigned not null default 0 comment '状态，0：未完成，1：已完成',
create_time bigint unsigned not null default 0 comment '创建时间',
primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 comment '文件缓存表';

create table tmp_file_chunk (
id bigint unsigned not null auto_increment,
tmp_file_id bigint unsigned not null default 0 comment '文件id',
offset bigint unsigned not null default 0 comment '偏移量',
chunk_size bigint unsigned not null default 0 comment '分片大小',
state tinyint unsigned not null default 0 comment '状态，0：未完成，1：已完成',
server_path varchar(255) not null default '' comment '服务器存储路径',
create_time bigint unsigned not null default 0 comment '创建时间',
unique key (tmp_file_id, offset),
primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 comment '文件分片表';
