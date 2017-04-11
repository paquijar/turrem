import { CompresoresEafitPage } from './app.po';

describe('compresores-eafit App', () => {
  let page: CompresoresEafitPage;

  beforeEach(() => {
    page = new CompresoresEafitPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
