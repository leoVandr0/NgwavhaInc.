# 🚀 Cloudflare R2 + Railway Setup

## 📋 **Railway Environment Variables**

### **1. Railway Dashboard**
- Go to Railway project
- Settings → Variables
- Add these variables:

```
CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id  
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET=your_bucket_name
CLOUDFLARE_R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
```

### **2. Get Cloudflare R2 Credentials**

#### **Cloudflare Dashboard → R2 → Create R2 Bucket**
- Note Account ID, Access Key ID, Secret Access Key
- Bucket name and endpoint URL

### **3. Update Server Code**

#### **Install SDK**
```bash
cd server
npm install @aws-sdk/client-s3
```

#### **Create R2 Storage Service**
```javascript
// services/r2Storage.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  }
});

export const uploadToR2 = async (file, key) => {
  const params = {
    Bucket: process.env.CLOUDFLARE_R2_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await r2Client.send(new PutObjectCommand(params));
  return `${process.env.CLOUDFLARE_R2_ENDPOINT}/${key}`;
};
```

### **4. Update Upload Controller**
```javascript
// controllers/upload.controller.js
import { uploadToR2 } from '../services/r2Storage';

export const uploadFile = async (req, res) => {
  try {
    const file = req.file;
    const key = `uploads/${Date.now()}-${file.originalname}`;
    const url = await uploadToR2(file, key);
    
    res.json({ success: true, url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

## 🔄 **Deployment Steps**

1. **Add Environment Variables** to Railway
2. **Update Server Code** with R2 integration
3. **Deploy** to Railway
4. **Test** file uploads

**Your files will be stored in Cloudflare R2 instead of Railway filesystem!** ☁️
