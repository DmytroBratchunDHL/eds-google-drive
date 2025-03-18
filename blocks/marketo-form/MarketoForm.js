/* eslint-disable */
import shared from './Shared.js';

/**
 * Class that powers up the two 'marketo' components - inlineshipnowmarketo & inlineshipnowmarketoconfigurable.
 * Contains logic to submit both kinds of form - there are subtle, but important differences in their
 * implementation. Logic in this class is tightly coupled with the HTL templates for both AEM components. You have
 * been warned.
 */
class MarketForm {
  constructor() {
    this.sel = {
      component: '[data-marketo-form]',
    };
    this.originalFormValues = {};
    this.init = this.init.bind(this);
  }

  init() {
    const components = document.querySelectorAll(this.sel.component);
    if (components.length === 0) {
      return false;
    }
    components.forEach(() => this.bindEvents());
    return true;
  }

  isValidAPISubmission(baseElement) {
    if (baseElement !== null) {
      const hiddenFormId = baseElement.getAttribute('hiddenFormId');
      return hiddenFormId !== null && hiddenFormId !== '';
    }
    return false;
  }

  loadMarketoForm(formUrl, munchkinId, formId) {
    window.MktoForms2.loadForm(formUrl, munchkinId, formId);
  }

  buildFormData(visibleFormFields, formId, formStart) {
    const formData = new FormData();
    for (const [key, value] of Object.entries(visibleFormFields)) {
      if (key.toLowerCase() === 'formid' || key.toLowerCase() === 'formvid') {
        continue;
      }
      formData.set(key, value);
    }
    const cookie = this.findMarketoCookie();
    if (cookie !== null) {
      formData.set('user_info_cookie', cookie);
    }
    formData.set('formId', formId);
    formData.set('formStart', formStart);
    return formData;
  }

  findMarketoCookie() {
    const allCookies = document.cookie.split('; ');
    return allCookies.find(value => value.toLowerCase().includes('_mkto_trk')) || null;
  }

  async submitForm(url, form) {
    return await fetch(url, {
      method: 'POST',
      body: form || '',
    });
  }

  processMarketoConfigurableForm(baseElement) {
    const munchkinId = baseElement.getAttribute('munchkinid');
    const formId = baseElement.getAttribute('formid');
    const visibleFormHost = baseElement.getAttribute('formHost') || 'https://express-resource.dhl.com';
    this.loadMarketoForm(visibleFormHost, munchkinId, formId);
    window.MktoForms2.whenReady((originalForm) => {
      document.getElementById('mktoForms2BaseStyle')?.remove();
      document.getElementById('mktoForms2ThemeStyle')?.remove();
      document.getElementById('mktoLoader')?.remove();
      originalForm.onSuccess((values, thankYouUrl) => {
        const hiddenFormId = baseElement.getAttribute('hiddenFormId');
        const formSubmissionPath = baseElement.getAttribute('action');
        const formStart = baseElement.getAttribute('formstart');
        if (this.isValidAPISubmission(baseElement) && formStart && hiddenFormId && formSubmissionPath) {
          const formData = this.buildFormData(values, hiddenFormId, formStart);
          shared.submitForm(formSubmissionPath, formData).then((response) => {
            if (response.status == 202) {
              console.log('Second submission was a success');
            }
            this.handleRedirect(baseElement, thankYouUrl);
          });
        } else {
          this.handleRedirect(baseElement, thankYouUrl);
        }
        return false;
      });
    });
  }

  handleRedirect(baseElement, url) {
    const virtualLink = document.createElement('a');
    virtualLink.href = url;
    virtualLink.target = '_self';
    virtualLink.style.display = 'none';
    baseElement.getAttributeNames().forEach(attr => virtualLink.setAttribute(attr, baseElement.getAttribute(attr)));
    document.body.appendChild(virtualLink);
    virtualLink.click();
  }

  processMarketoNonConfigurableForm(baseElement) {
    const hiddenFormId = baseElement.getAttribute('hiddenFormId');
    const hiddenMunchkinId = baseElement.getAttribute('hiddenMunchkinId');
    const formHost = baseElement.getAttribute('formHost');
    window.MktoForms2.whenReady((marketoForm) => {
      document.getElementById('mktoForms2BaseStyle')?.remove();
      document.getElementById('mktoForms2ThemeStyle')?.remove();
      if (marketoForm.getId().toString() === baseElement.getAttribute('formid').toString()) {
        marketoForm.onSuccess((e) => {
          window.MktoForms2.loadForm(formHost, hiddenMunchkinId, hiddenFormId, (hiddenForm) => {
            const submittedData = { ...e, ...hiddenForm.getValues() };
            Object.keys(submittedData).forEach(key => hiddenForm.addHiddenFields({ [key]: submittedData[key] }));
            hiddenForm.submit();
          });
        });
      }
    });
  }

  getMarketoForm(hostname, munchkinId, formId) {
    return window.MktoForms2.getForm(formId) || this.loadMarketoForm(hostname, munchkinId, formId);
  }

  processMarketoSignUpForm(baseElement) {
    const hiddenFormId = baseElement.getAttribute('formId');
    const hiddenMunchkinId = baseElement.getAttribute('munchkinId');
    const formHost = baseElement.getAttribute('formHost');
    this.loadMarketoForm(formHost, hiddenMunchkinId, hiddenFormId);
    window.MktoForms2.whenReady(() => {
      document.getElementById('mktoForms2BaseStyle')?.remove();
      document.getElementById('mktoForms2ThemeStyle')?.remove();
    });
  }

  async bindEvents() {
    const baseElement = document.querySelector('div[data-marketo-form]');
    if (baseElement) {
      const source = baseElement.getAttribute('source');
      if (source === 'noconf') {
        this.processMarketoNonConfigurableForm(baseElement);
      } else if (source === 'conf') {
        this.processMarketoConfigurableForm(baseElement);
      } else if (source === 'signup') {
        this.processMarketoSignUpForm(baseElement);
      }
    }
  }
}

export default new MarketForm();