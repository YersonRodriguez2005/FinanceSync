import api from '../api/axios';

export const downloadExtractPDF = async (month, year) => {
    // Le decimos a Axios que la respuesta será un archivo binario (Blob)
    const response = await api.get(`/reports/extract?month=${month}&year=${year}`, {
        responseType: 'blob',
    });
    return response.data;
};