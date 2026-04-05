using Microsoft.AspNetCore.Mvc.ApplicationModels;

public class RoutePrefixConvention : IControllerModelConvention
{
    private readonly string _prefix;

    public RoutePrefixConvention(string prefix)
    {
        _prefix = prefix;
    }

    public void Apply(ControllerModel controller)
    {
        // Add the route prefix to all controllers globally
        foreach (var selector in controller.Selectors)
        {
            selector.AttributeRouteModel = new AttributeRouteModel
            {
                Template = $"{_prefix}/{selector.AttributeRouteModel?.Template}"
            };
        }
    }
}
