const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    res.status(err.status || 500).json({
        message: err.message || 'Error interno del servidor'
    });
};

const errorInit = (status, message, endpoint) => {
    const error = new Error(message);
    error.status = status;

    return error;
};

const errorCatcher = fn => (req, res, next) => {
    fn(req, res, next).catch(err => {
        if (err.status && err.service) {
            return next(err);
        }

        const formatted = errorInit(
            err.status || 500,
            err.message || "Error inesperado",
            req.originalUrl
        );

        next(formatted)
    })
}

module.exports = {
    errorHandler,
    errorInit,
    errorCatcher
}