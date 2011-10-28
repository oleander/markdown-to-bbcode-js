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
});