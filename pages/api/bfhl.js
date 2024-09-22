import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async (req, res) => {
  try {
    if (req.method === 'POST') {
      await runMiddleware(req, res, upload.single('file'));
      if (!req.body) {
        return res.status(400).json({ is_success: false, error: "Request body is missing" });
      }
      const { data, file_b64 } = req.body;
      if (!Array.isArray(data)) {
        return res.status(400).json({ is_success: false, error: "data must be an array" });
      }
      const numbers = data.filter(item => !isNaN(item));
      const alphabets = data.filter(item => isNaN(item));
      const lowerCaseAlphabets = alphabets.filter(item => /[a-z]/.test(item));
      const highestLowerCaseAlphabet = lowerCaseAlphabets.length
        ? [lowerCaseAlphabets.sort().pop()]
        : [];
      let file_valid = false;
      let file_mime_type = '';
      let file_size_kb = 0;
      if (req.file) {
        file_valid = true;
        file_mime_type = req.file.mimetype;
        file_size_kb = req.file.size / 1024;
      } else if (file_b64) {
        const buffer = Buffer.from(file_b64, 'base64');
        file_valid = true;
        file_size_kb = buffer.length / 1024;
        file_mime_type = 'unknown'; 
      }

      const response = {
        is_success: true,
        user_id: "Riya", 
        email: "rr7455@srmist.edu.in",        
        roll_number: "RA2111029010036",      
        numbers,
        alphabets,
        highest_lowercase_alphabet: highestLowerCaseAlphabet,
        file_valid,
        file_mime_type,
        file_size_kb,
      };

      res.status(200).json(response);
    } else if (req.method === 'GET') {
      res.status(200).json({ operation_code: 1 });
    } else {
      res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    res.status(500).json({ is_success: false, error: error.message });
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};
