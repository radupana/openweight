package com.openweight.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
enum class WeightUnit {
    @SerialName("kg") KG,
    @SerialName("lb") LB
}

@Serializable
enum class DistanceUnit {
    @SerialName("m") M,
    @SerialName("km") KM,
    @SerialName("ft") FT,
    @SerialName("mi") MI,
    @SerialName("yd") YD
}
