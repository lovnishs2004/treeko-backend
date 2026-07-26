const express = require("express");
const multer = require("multer");
const Material = require("./material");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const isPdf = file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return cb(new Error("Only PDF files are allowed"));
    }

    cb(null, true);
  }
});

router.post("/", (req, res) => {
  upload.single("file")(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "PDF must be smaller than 10 MB" });
        }

        return res.status(400).json({ message: err.message });
      }

      if (err) {
        return res.status(400).json({ message: err.message || "Upload failed" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "PDF file is required" });
      }

      if (!req.body.title || !req.body.title.trim()) {
        return res.status(400).json({ message: "Title is required" });
      }

      const material = new Material({
        title: req.body.title,
        description: req.body.description,
        uploadedBy: req.body.uploadedBy,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        pdfData: req.file.buffer
      });

      await material.save();
      res.status(201).json({ message: "Material uploaded", materialId: material._id });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Upload failed" });
    }
  });
});

router.get("/", async (req, res) => {
  try {
    const materials = await Material.find({}, {
      pdfData: 0
    }).sort({ createdAt: -1 });

    res.json(materials);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Could not fetch materials" });
  }
});

router.get("/file/:id", async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).send("Material not found");
    }

    res.setHeader("Content-Type", material.mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${material.fileName}"`);
    res.send(material.pdfData);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error opening PDF");
  }
});

module.exports = router;
