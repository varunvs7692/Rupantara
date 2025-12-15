# Server image with required PDF/image tools
FROM node:20-bookworm

# Install system deps: LibreOffice (office → PDF), qpdf (encrypt/decrypt), Ghostscript (PDF/A), tesseract/poppler for future OCR
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
      libreoffice \
      qpdf \
      ghostscript \
      tesseract-ocr \
      poppler-utils \
      fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 5000
CMD ["node", "index.js"]
