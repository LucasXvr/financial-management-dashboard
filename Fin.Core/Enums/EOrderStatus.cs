using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fin.Core.Enums
{
    public enum EOrderStatus
    {
        WaitingPayment = 1,
        Paid = 2,
        Canceled = 3,
        Refunded = 4,
        Expired = 5
    }
}