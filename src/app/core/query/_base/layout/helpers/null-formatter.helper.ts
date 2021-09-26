export function nullFormatter(params) {
    if (params.value === undefined || params.value === null || params.value === '') {
      return '--';
    }
  }
