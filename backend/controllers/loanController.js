// controllers/loanController.js
const { getLoansDB, createLoanDB, payLoanDB, deleteLoanDB, updateLoanDB } = require('../models/loanModel');

const getLoans = async (req, res) => {
    try {
        const userId = req.user.id;
        const loans = await getLoansDB(userId);
        res.status(200).json({ success: true, data: loans });
    } catch (error) {
        console.error('Error al obtener préstamos:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

const createLoan = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Recibimos los datos del React
        const { person_name, total_amount, type } = req.body;

        if (!person_name || !total_amount) {
            return res.status(400).json({ success: false, message: 'Faltan datos obligatorios.' });
        }

        // Llamamos al modelo pasándole person_name a la posición de debtorName
        const newLoan = await createLoanDB(userId, person_name, total_amount, type || 'LENT');

        res.status(201).json({ success: true, data: newLoan });
    } catch (error) {
        console.error('🔥 ERROR CRÍTICO AL CREAR PRÉSTAMO:', error);
        res.status(500).json({ success: false, message: 'Error al registrar.' });
    }
};

const payLoan = async (req, res) => {
    try {
        const userId = req.user.id;
        const loanId = req.params.id;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'El abono debe ser mayor a cero.' });
        }

        const updatedLoan = await payLoanDB(loanId, userId, amount);

        if (!updatedLoan) {
            return res.status(404).json({ success: false, message: 'Préstamo no encontrado.' });
        }

        res.status(200).json({ 
            success: true, 
            message: updatedLoan.status === 'PAID' 
                ? '¡Felicidades! Este préstamo ha sido pagado en su totalidad.' 
                : 'Abono registrado con éxito.',
            data: updatedLoan 
        });
    } catch (error) {
        console.error('Error al registrar abono:', error);
        res.status(500).json({ success: false, message: 'Error al procesar el pago del préstamo.' });
    }
};

const deleteLoan = async (req, res) => {
    try {
        const userId = req.user.id;
        const loanId = req.params.id;
        const deletedLoan = await deleteLoanDB(loanId, userId);
        if (!deletedLoan) return res.status(404).json({ success: false, message: 'No encontrado' });
        res.status(200).json({ success: true, message: 'Eliminado.' });
    } catch (error) {
        console.error('🔥 ERROR AL ELIMINAR:', error); 
        res.status(500).json({ success: false, message: 'Error servidor.' });
    }
};

const updateLoan = async (req, res) => {
    try {
        const userId = req.user.id;
        const { person_name, total_amount, type } = req.body; // Recuerda el mapeo de person_name a debtor_name

        const updated = await updateLoanDB(req.params.id, userId, person_name, total_amount, type);
        if (!updated) return res.status(404).json({ success: false, message: 'Préstamo no encontrado' });

        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
};

module.exports = { getLoans, createLoan, payLoan, deleteLoan, updateLoan };