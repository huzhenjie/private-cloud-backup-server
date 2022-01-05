# API for H5

## User Guide

### * Register

> POST /api/v1/h5/account

#### Parameters

| Name     | Type   | In   | Required | Description |
|----------|--------|------|----------|-------------|
| username | string | body | Yes      | Username    |
| pwd      | string | body | Yes      | Password    |
| nick     | string | body | Yes      | Nick name   |

#### Code samples

Shell

```shell
curl \
  -X POST \
  -H 'Content-Type: application/json' \
  http://localhost:5233/api/v1/h5/account \
  -d '{"username":"admin","pwd":"admin","nick":"admin"}'
```

#### Response for completed conclusion

```json
{
  "code": 200,
  "msg": "ok"
}
```

## Backup Guide

### * Apply upload

***Note:*** Get upload URL before upload.

> POST /api/v1/h5/upload/apply

#### Parameters

| Name      | Type   | In   | Required | Description               |
|-----------|--------|------|----------|---------------------------|
| file_name | string | body | true     | The name of the file      |
| file_type | string | body | true     | The type of the file      |
| file_size | long   | body | true     | The size of the file      |
| file_time | long   | body |          | The file time of the file |
| width     | int    | body |          | The width of the file     |
| height    | int    | body |          | The height of the file    |

#### Code samples

Shell

```shell
curl \
  -X POST \
  -H 'Content-Type: application/json' \
  http://localhost:5233/api/v1/h5/upload/apply \
  -d '[{"file_name":"key.zip","file_type":"application/octet-stream","file_size":2928},{"file_name":"10078755429403414264.pdf","file_type":"application/octet-stream","file_size":7348}]'
```

#### Response for completed conclusion

```json
{
  "data": [
    {
      "file_name": "key.zip",
      "file_type": "application/octet-stream",
      "exist_file_cnt": 0,
      "chunks": [
        {
          "offset": 0,
          "chunk_size": 1024,
          "upload_url": "/api/v1/h5/upload/1/0"
        },
        {
          "offset": 1024,
          "chunk_size": 1024,
          "upload_url": "/api/v1/h5/upload/1/1024"
        },
        {
          "offset": 2048,
          "chunk_size": 880,
          "upload_url": "/api/v1/h5/upload/1/2048"
        }
      ],
      "id": 1
    },
    {
      "file_name": "10078755429403414264.pdf",
      "file_type": "application/octet-stream",
      "exist_file_cnt": 0,
      "chunks": [
        {
          "offset": 0,
          "chunk_size": 1024,
          "upload_url": "/api/v1/h5/upload/2/0"
        },
        {
          "offset": 1024,
          "chunk_size": 1024,
          "upload_url": "/api/v1/h5/upload/2/1024"
        },
        {
          "offset": 2048,
          "chunk_size": 1024,
          "upload_url": "/api/v1/h5/upload/2/2048"
        },
        {
          "offset": 3072,
          "chunk_size": 1024,
          "upload_url": "/api/v1/h5/upload/2/3072"
        },
        {
          "offset": 4096,
          "chunk_size": 1024,
          "upload_url": "/api/v1/h5/upload/2/4096"
        },
        {
          "offset": 5120,
          "chunk_size": 1024,
          "upload_url": "/api/v1/h5/upload/2/5120"
        },
        {
          "offset": 6144,
          "chunk_size": 1024,
          "upload_url": "/api/v1/h5/upload/2/6144"
        },
        {
          "offset": 7168,
          "chunk_size": 180,
          "upload_url": "/api/v1/h5/upload/2/7168"
        }
      ],
      "id": 2
    }
  ],
  "code": 200,
  "msg": "ok"
}
```

### * File upload

> POST /api/v1/h5/upload/{id}/{offset}

#### Parameters

| Name   | Type | In   | Required | Description                                                       |
|--------|------|------|----------|-------------------------------------------------------------------|
| file   | file | body | true     | The file to be uploaded                                           |
| id     | long | path | true     | The id of the file, which is returned by the apply upload API     |
| offset | long | path | true     | The offset of the file, which is returned by the apply upload API |

#### Code samples

Shell

```shell
split -b 1024 /Users/huzhenjie/Downloads/key.zip /Users/huzhenjie/Downloads/key.zip.chunks.
ls /Users/huzhenjie/Downloads/key.zip.chunks.*

curl \
  -X POST \
  -F 'file=@/Users/huzhenjie/Downloads/key.zip.chunks.aa' \
  http://localhost:5233/api/v1/h5/upload/1/0
  
curl \
  -X POST \
  -F 'file=@/Users/huzhenjie/Downloads/key.zip.chunks.ab' \
  http://localhost:5233/api/v1/h5/upload/1/1024
  
curl \
  -X POST \
  -F 'file=@/Users/huzhenjie/Downloads/key.zip.chunks.ac' \
  http://localhost:5233/api/v1/h5/upload/1/2048
```

### * Combine upload

> POST /api/v1/h5/upload/{id}/combine

#### Parameters

| Name | Type | In   | Required | Description                                                   |
|------|------|------|----------|---------------------------------------------------------------|
| id   | long | path | true     | The id of the file, which is returned by the apply upload API |

#### Code samples

Shell

```shell
curl \
  -X POST \
  http://localhost:5233/api/v1/h5/upload/1/combine
```

#### Response for completed conclusion

```json
{
  "code": 200,
  "msg": "ok"
}
```

### * Get image list

> [GET] /api/v1/h5/img

#### Parameters

| Name          | Type | In    | Required | Description                                                           |
|---------------|------|-------|----------|-----------------------------------------------------------------------|
| last_id       | long | query | false    | The last id of the image list, which is returned by the current API   |
| last_img_time | long | query | false    | The last time of the image list, which is returned by the current API |

#### Code samples

Shell

```shell
curl \
  -X GET \
  'http://localhost:5233/api/v1/h5/img?last_id=0&last_img_time=0'
```

#### Response for completed conclusion

```json
{
  "data": {
    "last_id": 1,
    "last_file_time": 1638957519507,
    "items": [
      {
        "id": 2,
        "file_size": 216096,
        "file_md5": "a37eb92184a568455c0643e78bd78f36",
        "file_name": "ile_Doc_0_Page_0.png",
        "file_type": "image/png",
        "file_time": 1638957519507,
        "client_type": 1,
        "width": 1587,
        "height": 1058,
        "create_time": 1639617417932,
        "file_url": "/api/v1/h5/file/2"
      },
      {
        "id": 1,
        "file_size": 216096,
        "file_md5": "a37eb92184a568455c0643e78bd78f36",
        "file_name": "ile_Doc_0_Page_0.png",
        "file_type": "image/png",
        "file_time": 1638957519507,
        "client_type": 1,
        "width": 1587,
        "height": 1058,
        "create_time": 1639583478225,
        "file_url": "/api/v1/h5/file/1"
      }
    ]
  },
  "code": 200,
  "msg": "ok"
}
```
