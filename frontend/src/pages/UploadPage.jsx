import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import DropZone from '../components/upload/DropZone';
import FilePreview from '../components/upload/FilePreview';
import UploadProgress from '../components/upload/UploadProgress';
import { useUpload } from '../contexts/UploadContext';
import { useNotification } from '../contexts/NotificationContext';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const { submitUpload } = useUpload();
  const { notify } = useNotification();
  const navigate = useNavigate();

  const handleFileChange = (f, error) => {
    setFile(f);
    setFileError(error);
    setServerError(null);
  };

  const handleSubmit = async () => {
    if (!file) return;

    setUploading(true);
    setServerError(null);

    try {
      const formData = new FormData();
      formData.append('csv_file', file);
      const upload = await submitUpload(formData);
      notify('success', 'Upload started!');
      navigate(`/uploads/${upload.id}`);
    } catch (err) {
      if (err.response?.status === 422) {
        const msg = err.response?.data?.errors?.csv_file?.[0] || 'Validation failed';
        setServerError(msg);
        setFile(null);
      } else {
        notify('error', err.displayMessage || 'Upload failed');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <Card title="Upload CSV File">
        <DropZone
          file={file}
          onFileChange={handleFileChange}
          error={fileError}
        />

        {file && !fileError && (
          <FilePreview
            file={file}
            onRemove={() => { setFile(null); setFileError(null); setServerError(null); }}
          />
        )}

        {serverError && (
          <p className="text-sm text-red-400 mt-3">{serverError}</p>
        )}

        {uploading && <UploadProgress />}

        <div className="mt-6">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!file || !!fileError || uploading}
            onClick={handleSubmit}
          >
            {uploading ? 'Uploading...' : 'Upload CSV'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
