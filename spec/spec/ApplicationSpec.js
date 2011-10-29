describe("Converter", function() {
  beforeEach(function() {
    converter = new Converter();
  });
  
  describe("#url", function() {
    it("converters markdown url to bbcode url", function() {
      expect(converter.url("[Data](A)")).toEqual('[URL="A"]Data[/URL]');
    });
    
    it("converters markdown urls to bbcode urls", function() {
      expect(converter.url("[Data1](A)[Data2](B)")).toEqual('[URL="A"]Data1[/URL][URL="B"]Data2[/URL]');
    });
  });
  
  describe("#code", function() {
    it("converters markdown code `Code` to a BBCode tag", function() {
      expect(converter.code("`Code!`")).toEqual('[CODE]Code![/CODE]');
    });
    
    it("converters markdown code ``` to a BBCode tag", function() {
      expect(converter.code("```\nCode!\n```")).toEqual('[CODE]Code![/CODE]');
    });    
    
    it("converters markdown html code ``` to a BBCode tag", function() {
      expect(converter.code("``` html\nCode!\n```")).toEqual('[HTML]Code![/HTML]');
    });    
    
    it("converters markdown php code ``` to a BBCode tag", function() {
      expect(converter.code("``` php\nCode!\n```")).toEqual('[PHP]Code![/PHP]');
    });    
    
    it("converters markdown php code ``` to a BBCode tag", function() {
      expect(converter.code("```php\nCode!\n```")).toEqual('[PHP]Code![/PHP]');
    });
    
    it("converters markdown random code ``` to a BBCode tag", function() {
      expect(converter.code("``` random\nCode!\n```")).toEqual('[CODE]Code![/CODE]');
    });
    
    it("converters markdown 4 space indent to a BBCode tag, start with a new line", function() {
      expect(converter.code("\n    This is code!")).toEqual('[CODE]This is code![/CODE]');
    });
    
    it("converters markdown 4 space indent to a BBCode tag, start and end with a new line", function() {
      expect(converter.code("\n    This is code!\n")).toEqual('[CODE]This is code![/CODE]');
    });
    
  });
});