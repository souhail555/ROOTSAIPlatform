export default function handler(req, res) {
  if (req.method === 'POST') {
    return res.status(200).json({ success: true, message: "Published successfully" });
  }
  return res.status(200).json({ status: "API is active" });
}
