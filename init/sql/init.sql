create
database private_cloud;
use
private_cloud;

create table client_account
(
    id          int(11) not null auto_increment,
    uid         char(16)     not null comment 'user id',
    username    varchar(128) not null comment 'username',
    pwd         char(32)     not null comment 'Password',
    salt        char(8)      not null comment 'Salt for password',
    nick        varchar(64)  not null comment 'Nickname',
    create_time bigint unsigned not null default 0 comment 'Create Time',
    update_time bigint unsigned not null default 0 comment 'Update Time',
    unique key (uid),
    unique key (username),
    primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 comment 'Account For Client';

create table backup_file
(
    id          bigint unsigned not null auto_increment,
    uid         char(16)     not null comment 'user id',
    file_size   bigint unsigned not null default 0 comment 'Size of file',
    file_md5    char(32)     not null default '' comment 'MD5 of file',
    file_name   varchar(128) not null default '' comment 'Name of file',
    file_type   varchar(32)  not null default '' comment 'File type，eg: image/jpg，image/png',
    file_time   bigint unsigned not null default 0 comment 'Create Time of origin file',
    client_type tinyint unsigned not null default 0 comment 'Client Type，0：unknown，1：h5，2：android，3：ios，4：pc',
    width       int unsigned not null default 0 comment 'Image width',
    height      int unsigned not null default 0 comment 'Image height',
    server_path varchar(255) not null default '' comment 'Server path of file',
    origin_path varchar(255) not null default '' comment 'Client path of file',
    thumb_path  varchar(128) not null default '' comment 'Thumb path of file',
    create_time bigint unsigned not null default 0 comment 'Create Time',
    delete_time bigint unsigned not null default 0 comment 'Delete Time',
    primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 comment 'File For Backup';

create table tmp_file
(
    id          bigint unsigned not null auto_increment,
    uid         char(16)     not null comment 'user id',
    file_size   bigint unsigned not null default 0 comment 'Size of file',
    file_md5    char(32)     not null default '' comment 'MD5 of file',
    file_name   varchar(128) not null default '' comment 'Name of file',
    file_type   varchar(32)  not null default '' comment 'File type，eg: image/jpg，image/png',
    file_time   bigint unsigned not null default 0 comment 'Create Time of origin file',
    width       int unsigned not null default 0 comment 'Image width',
    height      int unsigned not null default 0 comment 'Image height',
    client_type tinyint unsigned not null default 0 comment 'Client type，eg: 0：unknown，1：h5，2：android，3：ios，4：pc',
    origin_path varchar(255) not null default '' comment 'Client path of file',
    state       tinyint unsigned not null default 0 comment 'State，0：undone，1：done',
    create_time bigint unsigned not null default 0 comment 'Create Time',
    primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 comment 'Tmp File For Backup';

create table tmp_file_chunk
(
    id          bigint unsigned not null auto_increment,
    uid         char(16)     not null comment 'user id',
    tmp_file_id bigint unsigned not null default 0 comment 'tmp_file.id',
    offset      bigint unsigned not null default 0 comment 'Offset of file',
    chunk_size  bigint unsigned not null default 0 comment 'File size of chunk',
    state       tinyint unsigned not null default 0 comment 'State，0：undone，1：done',
    server_path varchar(255) not null default '' comment 'Server path of chunk',
    create_time bigint unsigned not null default 0 comment 'Create Time',
    unique key (tmp_file_id, offset),
    primary key (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 comment 'Tmp File Chunk For Backup';
