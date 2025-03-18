/* eslint-disable */
class Shared {
  constructor() {
    this.submitForm = this.submitForm.bind(this);
  }

  init() {
    return true;
  }

  /**
   * Submits the form identified by its url and backed up by its data. Always uses POST
   * @param {String} url  is the URL where we want to send the request
   * @param {Object} form  is an object representing the FormData
   * @return {Promise<Response>} a promise indicating either success or failure
   */
  async submitForm(url, form) {
    let formData;
    if (form !== null) {
      formData = form;
    }

    return fetch(url, {
      method: 'POST',
      body: formData || '',
    });
  }
}
export default new Shared();
