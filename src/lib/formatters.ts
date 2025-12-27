export const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const defaultOptions: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    };
    return new Date(date).toLocaleDateString('de-DE', options || defaultOptions);
};

export const formatShortDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('de-DE');
};
