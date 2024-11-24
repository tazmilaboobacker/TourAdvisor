// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import dotenv from "dotenv";
// import multer from "multer";
// import path from "path";
// import { fileURLToPath } from "url";

// dotenv.config(); // Load environment variables from .env file

// const app = express();
// app.use(express.json());
// app.use(cors()); // Enable CORS for all routes
// app.use(express.urlencoded({ extended: false }));

// // File upload setup
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploaded images statically

// // Configure Multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/"); // Save images in 'uploads' directory
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
//   },
// });
// const upload = multer({ storage });

// // MongoDB connection
// const uri = process.env.MONGODB_URI;
// mongoose
//   .connect(uri)
//   .then(() => {
//     console.log("MongoDB connected");
//   })
//   .catch((err) => {
//     console.error("MongoDB connection error:", err);
//   });

// // Define Movie schema
// const movieSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   description: { type: String, required: true },
//   genre: { type: String, required: true },
//   releaseYear: { type: Number, required: true },
//   posterUrl: { type: String }, // Poster URL field
// });

// const Movie = mongoose.model("Movie", movieSchema);

// // Create a new movie with a poster image
// app.post("/api/movies", upload.single("image"), async (req, res) => {
//   const newMovie = new Movie({
//     title: req.body.title,
//     description: req.body.description,
//     genre: req.body.genre,
//     releaseYear: req.body.releaseYear,
//     posterUrl: req.file ? `/uploads/${req.file.filename}` : null, // Save image URL
//   });

//   try {
//     const savedMovie = await newMovie.save();
//     res.status(200).json(savedMovie); // Return the saved movie with the poster URL
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Get all movies
// app.get("/api/movies", async (req, res) => {
//   try {
//     const limit = Number(req.query.limit);
//     const movies = limit ? await Movie.find().limit(limit) : await Movie.find();
//     res.status(200).json(movies); // Return the list of movies including posterUrl
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Get movie by ID
// app.get("/api/movies/:id", async (req, res) => {
//   try {
//     const movie = await Movie.findById(req.params.id);
//     res.status(200).json(movie); // Return a single movie
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Update movie (including an optional new poster image)
// app.put("/api/movies/:id", upload.single("image"), async (req, res) => {
//   try {
//     const updateData = {
//       title: req.body.title,
//       description: req.body.description,
//       genre: req.body.genre,
//       releaseYear: req.body.releaseYear,
//     };
//     if (req.file) {
//       updateData.posterUrl = `/uploads/${req.file.filename}`; // Update the poster URL
//     }

//     const movie = await Movie.findByIdAndUpdate(req.params.id, updateData, {
//       new: true,
//     });
//     if (movie) {
//       res.status(200).json(movie); // Return the updated movie
//     } else {
//       res.status(404).json("ID does not exist");
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Delete movie
// app.delete("/api/movies/:id", async (req, res) => {
//   try {
//     const movie = await Movie.findByIdAndDelete(req.params.id);
//     if (movie) {
//       res.status(200).json(movie); // Return the deleted movie
//     } else {
//       res.status(404).json("ID does not exist");
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });


import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Setup file path handling
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");  // Store uploaded files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    const originalName = file.originalname.split('.')[0]; // Get the original file name without the extension
    const timestamp = Date.now(); // Get the current timestamp
    const fileExtension = path.extname(file.originalname); // Get the file extension
  
    // Combine the original file name and the timestamp, followed by the file extension
    cb(null, `${originalName}-${timestamp}${fileExtension}`);
  }
  
  // filename: (req, file, cb) => {
  //   cb(null, Date.now() + path.extname(file.originalname));  // Unique filenames with timestamp
  // },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },  // Limit file size to 5MB
});

// MongoDB connection
const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/tourapp";
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define Tour schema and model
const tourSchema = new mongoose.Schema({
  state: { type: String, required: true },
  description: { type: String, required: true },
  places: { type: String, required: true },
  images: { type: [String], default: [] },  // Optional array for image URLs
});

const Tour = mongoose.model("Tour", tourSchema);

// Create a new tour (POST)
app.post("/api/tours", upload.array("images", 15), async (req, res) => {
  try {
    // Ensure images were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "At least one image is required" });
    }

    // Map the uploaded files to URLs
    const imageUrls = req.files.map((file) => `/uploads/${file.filename}`);

    const { state, description, places } = req.body;

    // Validate required fields
    if (!state || !description || !places) {
      return res.status(400).json({ error: "All fields (state, description, places) are required" });
    }

    // Create a new tour object
    const newTour = new Tour({ state, description, places, images: imageUrls });

    // Save the new tour to the database
    const savedTour = await newTour.save();

    // Respond with the saved tour
    res.status(201).json(savedTour);
  } catch (error) {
    console.error("Error creating tour:", error);  // Logs the error to the console
    res.status(500).json({ error: "Failed to create tour" });  // Respond with a 500 error if anything fails
  }
});

// Get all tours (GET)
app.get("/api/tours", async (req, res) => {
  try {
    const tours = await Tour.find();
    res.status(200).json(tours);
  } catch (error) {
    console.error("Error fetching tours:", error);
    res.status(500).json({ error: "Failed to fetch tours" });
  }
});

// Get a tour by ID (GET)
app.get("/api/tours/:id", async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (tour) {
      res.status(200).json(tour);
    } else {
      res.status(404).json({ error: "Tour not found" });
    }
  } catch (error) {
    console.error("Error fetching tour:", error);
    res.status(500).json({ error: "Failed to fetch tour" });
  }
});

// Update a tour (PUT)
app.put("/api/tours/:id", upload.array("images", 15), async (req, res) => {
  try {
    const { state, description, places } = req.body;

    // Prepare the data for updating
    const updateData = {
      state,
      description,
      places,
    };

    // Check if there are new images and process them
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map((file) => `/uploads/${file.filename}`);
      
      // Optional: Delete old images if no longer needed (make sure to compare with old data)
      const oldTour = await Tour.findById(req.params.id);
      if (oldTour && oldTour.images.length > 0) {
        oldTour.images.forEach((image) => {
          const imagePath = path.join(__dirname, image);
          if (fs.existsSync(imagePath)) {
            fs.unlink(imagePath, (err) => {
              if (err) console.error("Error deleting file:", err);
            });
          }
        });
      }
    }

    // Update the tour in the database
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (updatedTour) {
      res.status(200).json(updatedTour);
    } else {
      res.status(404).json({ error: "Tour not found" });
    }
  } catch (error) {
    console.error("Error updating tour:", error);
    res.status(500).json({ error: "Failed to update tour" });
  }
});

// Delete a tour (DELETE)
app.delete("/api/tours/:id", async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (tour) {
      // Delete associated images from the file system
      tour.images.forEach((image) => {
        const imagePath = path.join(__dirname, image);
        if (fs.existsSync(imagePath)) {
          fs.unlink(imagePath, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        }
      });
      res.status(200).json({ message: "Tour deleted successfully", tour });
    } else {
      res.status(404).json({ error: "Tour not found" });
    }
  } catch (error) {
    console.error("Error deleting tour:", error);
    res.status(500).json({ error: "Failed to delete tour" });
  }
});

// Start the server
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
