using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fin.Core.Requests
{
    public class PagedRequest
    {
        public int PageNumber { get; set; } = Configuration.DefaultPageNumber;
        public int PageSize { get; set; } = Configuration.DefaultPageSize;
    }
}